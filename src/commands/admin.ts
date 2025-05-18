import { CommandInteraction, SlashCommandBuilder, type CacheType, CommandInteractionOptionResolver, PermissionsBitField, Guild, GuildMember } from 'discord.js';
import { db } from '../services/db';
import { getFreeCompanyMembersById as getLodestoneFcMembers, getFreeCompanyById as getLodestoneFcDetails } from '../services/lodestone';
import type { Character as DbCharacter, GuildConfig as DbGuildConfig } from '@prisma/client';

export const name = 'admin';
export const data = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Administrative commands for bot management.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDMPermission(false) // Admin commands should be guild-only
    .addSubcommand(subcommand =>
        subcommand
            .setName('refresh_fc_members')
            .setDescription('Refresh the member list and FC association for characters from a specific FC.')
            .addStringOption(option =>
                option.setName('fc_id')
                    .setDescription('The Lodestone ID of the Free Company to refresh.')
                    .setRequired(true)));

export async function execute(interaction: CommandInteraction<CacheType>) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId) {
        await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        return;
    }

    // Double check permissions, though setDefaultMemberPermissions should handle it
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        return;
    }

    const options = interaction.options as CommandInteractionOptionResolver<CacheType>;
    const subcommand = options.getSubcommand();

    switch (subcommand) {
        case 'refresh_fc_members':
            await handleRefreshFcMembers(interaction, options);
            break;
        default:
            await interaction.reply({ content: 'Unknown admin subcommand.', ephemeral: true });
    }
}

async function handleRefreshFcMembers(interaction: CommandInteraction<CacheType>, options: CommandInteractionOptionResolver<CacheType>) {
    const fcIdOption = options.getString('fc_id', true);
    const fcIdBigInt = BigInt(fcIdOption);

    await interaction.deferReply({ ephemeral: true });

    const affectedOwnerIds = new Set<bigint>();

    try {
        // 1. Verify FC exists on Lodestone and update its own entry
        const lodestoneFc = await getLodestoneFcDetails(fcIdOption);
        if (!lodestoneFc) {
            await interaction.editReply({ content: `Free Company with ID ${fcIdOption} not found on Lodestone.` });
            return;
        }
        // Update our DB record for this FC (name, timestamp)
        await db.freeCompany.update(fcIdBigInt, lodestoneFc.Name);

        // 2. Fetch current members from Lodestone
        const lodestoneMembers = await getLodestoneFcMembers(fcIdOption);
        const lodestoneMemberIds = new Set(lodestoneMembers.map(m => BigInt(m.ID)));

        let updatedInFcCount = 0;
        let newlyAssociatedToFcCount = 0;
        let createdAndAssociatedCount = 0;

        // 3. Update characters in DB who are in this FC according to Lodestone
        for (const member of lodestoneMembers) {
            const memberIdBigInt = BigInt(member.ID);
            const existingDbCharacter: DbCharacter | null = await db.character.get(memberIdBigInt);

            if (existingDbCharacter) {
                if (existingDbCharacter.ownerId) {
                    affectedOwnerIds.add(existingDbCharacter.ownerId);
                }
                await db.character.update(memberIdBigInt, member.Name, fcIdBigInt);
                updatedInFcCount++;
            } else {
                // Character is in Lodestone FC but not in our DB. Create them without an owner.
                await db.character.create(memberIdBigInt, member.Name, null, fcIdBigInt);
                createdAndAssociatedCount++;
            }
        }

        // 4. Identify characters in DB who were in this FC but are no longer
        const dbCharactersInFc: DbCharacter[] = await db.freeCompany.getCharacters(fcIdBigInt);
        let removedFromFcCount = 0;

        for (const dbChar of dbCharactersInFc) {
            // dbChar is implicitly DbCharacter here due to the type of dbCharactersInFc
            if (!lodestoneMemberIds.has(dbChar.id)) {
                // This character was in the FC in our DB, but not in Lodestone's current list
                if (dbChar.ownerId) {
                    affectedOwnerIds.add(dbChar.ownerId);
                }
                // Set their FC to null. Keep their owner.
                await db.character.update(dbChar.id, dbChar.name, null);
                removedFromFcCount++;
            }
        }

        let rolesEvaluatedCount = 0;
        if (affectedOwnerIds.size > 0 && interaction.guild) {
            const guildConfig = await db.guildConfig.get(interaction.guildId!);
            for (const ownerId of affectedOwnerIds) {
                try {
                    const memberToUpdate = await interaction.guild.members.fetch(ownerId.toString());
                    if (memberToUpdate) {
                        await updateMemberRolesAfterSync(guildConfig, interaction.guild, memberToUpdate);
                        rolesEvaluatedCount++;
                    }
                } catch (roleError) {
                    console.error(`Failed to fetch member or update roles for user ${ownerId}:`, roleError);
                }
            }
        }

        await interaction.editReply({
            content: `FC member refresh for ${lodestoneFc.Name} (ID: ${fcIdOption}) complete.\\n` +
                `- Members updated/confirmed in FC: ${updatedInFcCount}\\n` +
                `- New members found in FC and added to DB: ${createdAndAssociatedCount}\\n` + // Added new counter
                `- Members no longer in FC (updated in DB): ${removedFromFcCount}\\n` +
                `- Roles of affected users re-evaluated: ${rolesEvaluatedCount}`
        });

    } catch (error) {
        console.error('Error in handleRefreshFcMembers:', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: 'An error occurred while refreshing FC members.' });
        } else {
            await interaction.reply({ content: 'An error occurred while refreshing FC members.', ephemeral: true });
        }
    }
}

async function updateMemberRolesAfterSync(config: DbGuildConfig | null, guild: Guild, memberToUpdate: GuildMember) {
    const discordUserId = BigInt(memberToUpdate.id);
    try {
        if (!config || (!config.memberRoleId && !config.guestRoleId)) {
            // No roles configured for this guild or specific roles not set
            return;
        }

        const { fcId: configuredFcId, memberRoleId, guestRoleId } = config;
        const userCharacters: DbCharacter[] = await db.user.getCharacters(discordUserId);

        let isInConfiguredFc = false;
        if (configuredFcId && userCharacters && userCharacters.length > 0) {
            // char is implicitly DbCharacter here due to the type of userCharacters
            isInConfiguredFc = userCharacters.some(char => char.freeCompanyId === BigInt(configuredFcId));
        }

        const targetAddRoleId = isInConfiguredFc ? memberRoleId : guestRoleId;
        const targetRemoveRoleId = isInConfiguredFc ? guestRoleId : memberRoleId;

        // Add the target role if it's set and the user doesn't have it
        if (targetAddRoleId && targetAddRoleId !== '' && !memberToUpdate.roles.cache.has(targetAddRoleId)) {
            try {
                await memberToUpdate.roles.add(targetAddRoleId);
            } catch (e) {
                console.error(`Failed to add role ${targetAddRoleId} to user ${discordUserId}:`, e);
            }
        }

        // Remove the other role if it's set and the user has it
        if (targetRemoveRoleId && targetRemoveRoleId !== '' && targetAddRoleId !== targetRemoveRoleId && memberToUpdate.roles.cache.has(targetRemoveRoleId)) {
            try {
                await memberToUpdate.roles.remove(targetRemoveRoleId);
            } catch (e) {
                console.error(`Failed to remove role ${targetRemoveRoleId} from user ${discordUserId}:`, e);
            }
        }
    } catch (error) {
        console.error(`Error in updateMemberRolesAfterSync for user ${discordUserId}:`, error);
    }
}
