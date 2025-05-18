import { Events } from "discord.js";
import { logger } from "../lib/logger";
import { TaruBot } from "../core/tarubot";

export const eventName = Events.ClientReady;
export const eventOnce = true;

export async function execute(client: TaruBot) {
    if (!client.user) {
        console.error("Client user is not defined.");
        return;
    }

    logger.info(`Logged in as ${client.user.tag} (${client.user.id}).`);


    logger.info("Registering application commands...");
    await client.registerApplicationCommands();
    logger.info("Application commands registered.");

    logger.info("Bot is ready!");

}