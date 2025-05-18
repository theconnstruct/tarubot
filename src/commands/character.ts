import { CommandInteraction, SlashCommandBuilder, type CacheType, CommandInteractionOptionResolver, MessageFlags, GuildMember } from 'discord.js';
import { db } from '../services/db';
import { getCharacterById as getLodestoneCharacterById, searchCharacter as searchLodestoneCharacter, type SimpleCharacter, type Character as LodestoneCharacterDetail } from '../services/lodestone';
import type { Character as DbCharacter } from '@prisma/client'; // Renamed to avoid conflict

export const name = 'character';
export const data = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Manage your claimed Final Fantasy XIV characters.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('claimbyid')
            .setDescription('Claim a character by their Lodestone ID.')
            .addIntegerOption(option =>
                option.setName('id')
                    .setDescription('The Lodestone ID of the character.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('claimbyname')
            .setDescription('Claim a character by their name and world.')
            .addStringOption(option =>
                option.setName('firstname')
                    .setDescription('The first name of the character.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('lastname')
                    .setDescription('The last name of the character.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('world')
                    .setDescription('The world of the character.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('unclaim')
            .setDescription('Unclaim a character.')
            .addIntegerOption(option => // Assuming unclaim by ID for now
                option.setName('id')
                    .setDescription('The Lodestone ID of the character to unclaim.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('List your claimed characters.'));

export async function execute(interaction: CommandInteraction<CacheType>) {
    if (!interaction.isChatInputCommand()) return;

    const options = interaction.options as CommandInteractionOptionResolver<CacheType>; // Cast to access specific methods
    const subcommand = options.getSubcommand();

    switch (subcommand) {
        case 'claimbyid':
            await handleClaimById(interaction, options);
            break;
        case 'claimbyname':
            await handleClaimByName(interaction, options);
            break;
        case 'unclaim':
            await handleUnclaim(interaction, options);
            break;
        case 'list':
            await handleList(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
    }
}

async function handleClaimById(interaction: CommandInteraction<CacheType>, options: CommandInteractionOptionResolver<CacheType>) {
    const characterIdOption = options.getInteger('id', true);
    const characterIdString = String(characterIdOption);
    const discordUserId = BigInt(interaction.user.id);

    try {
        const lodestoneCharacter: LodestoneCharacterDetail | null = await getLodestoneCharacterById(characterIdString);
        if (!lodestoneCharacter) {
            await interaction.reply({ content: `Character with ID ${characterIdString} not found on Lodestone.`, ephemeral: true });
            return;
        }

        const canonicalName = lodestoneCharacter.Name;
        const characterIdBigInt = BigInt(lodestoneCharacter.ID);
        const freeCompanyIdBigInt = lodestoneCharacter.FreeCompanyID ? BigInt(lodestoneCharacter.FreeCompanyID) : null;

        const existingCharacter: DbCharacter | null = await db.character.get(characterIdBigInt);

        if (existingCharacter) {
            if (existingCharacter.ownerId === discordUserId) {
                await interaction.reply({ content: `You have already claimed ${existingCharacter.name} (ID: ${characterIdBigInt}).`, ephemeral: true });
            } else {
                await interaction.reply({ content: `${existingCharacter.name} (ID: ${characterIdBigInt}) is already claimed by another user.`, ephemeral: true });
            }
        } else {
            await db.character.create(characterIdBigInt, canonicalName, discordUserId, freeCompanyIdBigInt);
            await interaction.reply({ content: `Successfully claimed ${canonicalName} (ID: ${characterIdBigInt})!`, ephemeral: true });
            await updateUserRolesBasedOnFC(interaction, discordUserId); // Add role update
        }
    } catch (error) {
        console.error('Error in handleClaimById:', error);
        await interaction.reply({ content: 'An error occurred while trying to claim the character by ID. Please ensure the ID is correct and Lodestone services are reachable.', ephemeral: true });
    }
}

async function handleClaimByName(interaction: CommandInteraction<CacheType>, options: CommandInteractionOptionResolver<CacheType>) {
    const firstName = options.getString('firstname', true);
    const lastName = options.getString('lastname', true);
    const world = options.getString('world', true);
    const discordUserId = BigInt(interaction.user.id);
    const fullNameForMessages = `${firstName} ${lastName}`; // For user-facing messages

    try {
        const lodestoneSearchResults: SimpleCharacter[] = await searchLodestoneCharacter(firstName, lastName, world);

        if (!lodestoneSearchResults || lodestoneSearchResults.length === 0) {
            await interaction.reply({ content: `Character "${fullNameForMessages}" on world "${world}" not found on Lodestone.`, ephemeral: true });
            return;
        }

        if (lodestoneSearchResults.length > 1) {
            const characterList = lodestoneSearchResults.map(c => `- ${c.Name} (ID: ${c.ID})`).join('\\n');
            await interaction.reply({ content: `Multiple characters found for "${fullNameForMessages}" on world "${world}":\\n${characterList}\\nPlease use the \`/character claimbyid\` command with the specific character ID.`, ephemeral: true });
            return;
        }
        // At this point, lodestoneSearchResults has exactly one element.
        const foundCharacter: SimpleCharacter = lodestoneSearchResults[0]!;
        const characterIdFromSearchString = foundCharacter.ID;

        const lodestoneCharacter: LodestoneCharacterDetail | null = await getLodestoneCharacterById(characterIdFromSearchString);
        if (!lodestoneCharacter) {
            await interaction.reply({ content: `Could not retrieve details for character ${foundCharacter.Name} (ID: ${characterIdFromSearchString}). This might be a temporary Lodestone issue. Please try again.`, ephemeral: true });
            return;
        }

        const canonicalName = lodestoneCharacter.Name;
        const characterIdBigInt = BigInt(lodestoneCharacter.ID);
        const freeCompanyIdBigInt = lodestoneCharacter.FreeCompanyID ? BigInt(lodestoneCharacter.FreeCompanyID) : null;

        const existingCharacter: DbCharacter | null = await db.character.get(characterIdBigInt);

        if (existingCharacter) {
            if (existingCharacter.ownerId === discordUserId) {
                await interaction.reply({ content: `You have already claimed ${canonicalName} (ID: ${characterIdBigInt}).`, ephemeral: true });
            } else {
                await interaction.reply({ content: `${canonicalName} (ID: ${characterIdBigInt}) is already claimed by another user.`, ephemeral: true });
            }
        } else {
            await db.character.create(characterIdBigInt, canonicalName, discordUserId, freeCompanyIdBigInt);
            await interaction.reply({ content: `Successfully claimed ${canonicalName} (ID: ${characterIdBigInt})!`, ephemeral: true });
            await updateUserRolesBasedOnFC(interaction, discordUserId); // Add role update
        }
    } catch (error) {
        console.error('Error in handleClaimByName:', error);
        await interaction.reply({ content: 'An error occurred while trying to claim the character by name. Please ensure the name and world are correct and Lodestone services are reachable.', ephemeral: true });
    }
}

async function handleUnclaim(interaction: CommandInteraction<CacheType>, options: CommandInteractionOptionResolver<CacheType>) {
    const characterIdOption = options.getInteger('id', true);
    const characterIdToUnclaim = BigInt(characterIdOption);
    const discordUserId = BigInt(interaction.user.id);

    try {
        const character = await db.character.get(characterIdToUnclaim);

        if (!character) {
            await interaction.reply({ content: `Character with ID ${characterIdOption} not found in our records.`, ephemeral: true });
            return;
        }

        if (character.ownerId !== discordUserId) {
            await interaction.reply({ content: `You cannot unclaim ${character.name} (ID: ${characterIdOption}) as you are not the owner.`, ephemeral: true });
            return;
        }

        const deleteResult = await db.character.delete(characterIdToUnclaim, discordUserId);

        if (deleteResult.count > 0) {
            await interaction.reply({ content: `Successfully unclaimed ${character.name} (ID: ${characterIdOption}).`, ephemeral: true });
            await updateUserRolesBasedOnFC(interaction, discordUserId); // Add role update
        } else {
            // This case should ideally not be reached if the above checks for existence and ownership pass,
            // unless there's a race condition or an unexpected issue.
            await interaction.reply({ content: `Failed to unclaim ${character.name} (ID: ${characterIdOption}). The character might have already been unclaimed or an error occurred.`, ephemeral: true });
        }
    } catch (error) {
        console.error('Error in handleUnclaim:', error);
        await interaction.reply({ content: 'An error occurred while trying to unclaim the character.', ephemeral: true });
    }
}

async function handleList(interaction: CommandInteraction<CacheType>) {
    const discordUserId = BigInt(interaction.user.id);

    try {
        const characters: DbCharacter[] = await db.user.getCharacters(discordUserId); // Corrected type to DbCharacter

        if (!characters || characters.length === 0) {
            await interaction.reply({ content: 'You have not claimed any characters yet.', ephemeral: true });
            return;
        }

        const characterList = characters
            .map((char: DbCharacter) => `- ${char.name} (ID: ${char.id})`) // Corrected type to DbCharacter
            .join('\\n');

        await interaction.reply({ content: `Your claimed characters:\\n${characterList}`, ephemeral: true });

    } catch (error) {
        console.error('Error in handleList:', error);
        await interaction.reply({ content: 'An error occurred while trying to list your characters.', ephemeral: true });
    }
}

async function updateUserRolesBasedOnFC(interaction: CommandInteraction<CacheType>, discordUserId: bigint) {
    if (!interaction.guild || !interaction.guildId) {
        // Cannot manage roles if not in a guild context
        return;
    }

    const guildMember = interaction.member as GuildMember; // Already fetched by Discord.js usually
    if (!guildMember) {
        // console.error('Could not find GuildMember for role update.');
        return;
    }

    try {
        const config = await db.guildConfig.get(interaction.guildId);
        if (!config || (!config.memberRoleId && !config.guestRoleId)) {
            // No roles configured for this guild
            return;
        }

        const { fcId: configuredFcId, memberRoleId, guestRoleId } = config;

        const userCharacters = await db.user.getCharacters(discordUserId);

        let isInConfiguredFc = false;
        if (configuredFcId && userCharacters && userCharacters.length > 0) {
            isInConfiguredFc = userCharacters.some(char => char.freeCompanyId === BigInt(configuredFcId));
        }

        const targetAddRoleId = isInConfiguredFc ? memberRoleId : guestRoleId;
        const targetRemoveRoleId = isInConfiguredFc ? guestRoleId : memberRoleId;

        // Add the target role if it's set and the user doesn't have it
        if (targetAddRoleId && !guildMember.roles.cache.has(targetAddRoleId)) {
            try {
                await guildMember.roles.add(targetAddRoleId);
            } catch (e) {
                console.error(`Failed to add role ${targetAddRoleId} to user ${discordUserId}:`, e);
            }
        }

        // Remove the other role if it's set and the user has it
        if (targetRemoveRoleId && targetAddRoleId !== targetRemoveRoleId && guildMember.roles.cache.has(targetRemoveRoleId)) {
            try {
                await guildMember.roles.remove(targetRemoveRoleId);
            } catch (e) {
                console.error(`Failed to remove role ${targetRemoveRoleId} from user ${discordUserId}:`, e);
            }
        }

    } catch (error) {
        console.error('Error in updateUserRolesBasedOnFC:', error);
        // Optionally, notify user of role update failure, but keep it silent for now to avoid spam
        // await interaction.followUp({ content: 'There was an issue updating your roles.', ephemeral: true });
    }
}
