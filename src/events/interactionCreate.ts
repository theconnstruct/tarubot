import { Events, MessageFlags, type Interaction } from "discord.js";
import { logger } from "../lib/logger";
import { TaruBot } from "../core/tarubot";

export const eventName = Events.InteractionCreate;
export const eventOnce = true;

export async function execute(client: TaruBot, interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`Command ${interaction.commandName} not found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}: ${error}`);
        await interaction.reply({ content: "There was an error while executing this command.", flags: MessageFlags.Ephemeral });
    }
}