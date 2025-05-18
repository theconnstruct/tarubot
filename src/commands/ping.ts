import { CommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

export const name = 'ping';
export const data = new SlashCommandBuilder().setName(name).setDescription('Ping the bot to check if it is alive.');

export async function execute(interaction: CommandInteraction) {
    await interaction.reply({ content: 'Pong!', flags: MessageFlags.Ephemeral });
}