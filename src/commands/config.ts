import { CommandInteraction, SlashCommandBuilder, type CacheType, CommandInteractionOptionResolver, PermissionsBitField, Role } from 'discord.js';
import { db } from '../services/db';

export const name = 'config';
export const data = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Configure bot settings for this guild.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Only administrators can use this command
    .addSubcommand(subcommand =>
        subcommand
            .setName('memberrole')
            .setDescription('Set the role for verified FC members.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to assign to FC members.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('guestrole')
            .setDescription('Set the role for guests (non-FC members).')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to assign to guests.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('fcid')
            .setDescription('Set the expected Free Company ID for this server.')
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('The Lodestone ID of the Free Company.')
                    .setRequired(true)));

export async function execute(interaction: CommandInteraction<CacheType>) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId) {
        await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        return;
    }

    // Ensure the user has administrator permissions (double check, though default_member_permissions should handle it)
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        return;
    }

    const options = interaction.options as CommandInteractionOptionResolver<CacheType>;
    const subcommand = options.getSubcommand();

    switch (subcommand) {
        case 'memberrole':
            await handleSetMemberRole(interaction, options);
            break;
        case 'guestrole':
            await handleSetGuestRole(interaction, options);
            break;
        case 'fcid':
            await handleSetFcId(interaction, options);
            break;
        default:
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
    }
}

async function handleSetMemberRole(interaction: CommandInteraction<CacheType>, options: CommandInteractionOptionResolver<CacheType>) {
    if (!interaction.guildId) return; // Should be caught above, but good for type safety

    const role = options.getRole('role', true) as Role;

    try {
        await db.guildConfig.setMemberRole(interaction.guildId, role.id);
        await interaction.reply({ content: `Successfully set the member role to ${role.name}.`, ephemeral: true });
    } catch (error) {
        console.error('Error in handleSetMemberRole:', error);
        await interaction.reply({ content: 'An error occurred while setting the member role.', ephemeral: true });
    }
}

async function handleSetGuestRole(interaction: CommandInteraction<CacheType>, options: CommandInteractionOptionResolver<CacheType>) {
    if (!interaction.guildId) return; // Should be caught above, but good for type safety

    const role = options.getRole('role', true) as Role;

    try {
        await db.guildConfig.setGuestRole(interaction.guildId, role.id);
        await interaction.reply({ content: `Successfully set the guest role to ${role.name}.`, ephemeral: true });
    } catch (error) {
        console.error('Error in handleSetGuestRole:', error);
        await interaction.reply({ content: 'An error occurred while setting the guest role.', ephemeral: true });
    }
}

async function handleSetFcId(interaction: CommandInteraction<CacheType>, options: CommandInteractionOptionResolver<CacheType>) {
    if (!interaction.guildId) return;

    const fcId = options.getString('id', true);

    try {
        // You might want to add validation here to ensure fcId is a valid Lodestone ID format
        // or even try to fetch the FC from Lodestone to confirm it exists.
        await db.guildConfig.setFcId(interaction.guildId, fcId);
        await interaction.reply({ content: `Successfully set the Free Company ID to ${fcId}.`, ephemeral: true });
    } catch (error) {
        console.error('Error in handleSetFcId:', error);
        await interaction.reply({ content: 'An error occurred while setting the Free Company ID.', ephemeral: true });
    }
}
