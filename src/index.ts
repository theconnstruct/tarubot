import { logger } from "./lib/logger";
import { TaruBot } from "./core/tarubot";

if (!Bun.env.DISCORD_TOKEN) {
    logger.error("DISCORD_TOKEN is not set. Please set it in your environment variables.");
    process.exit(1);
}

if (!Bun.env.DISCORD_APP_ID) {
    logger.error("DISCORD_APP_ID is not set. Please set it in your environment variables.");
    process.exit(1);
}

if (!Bun.env.NODESTONE_URL) {
    logger.error("NODESTONE_URL is not set. Please set it in your environment variables.");
    process.exit(1);
}

const client = new TaruBot({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildMembers",
    ],
});

await client.loadCommandsAndEvents();

logger.info("Bot starting up...");

client.login(Bun.env.DISCORD_TOKEN).catch((error: Error) => {
    logger.error("Error logging in:", error);
});