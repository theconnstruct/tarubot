import { Client, Collection, REST, Routes, type ApplicationCommandDataResolvable } from "discord.js";
import { logger } from "../lib/logger";
import { readdirSync } from "fs";
import type { Command, Event } from "../types/global";

export class TaruBot extends Client {
    public commands: Collection<string, Command>;

    constructor(options: ConstructorParameters<typeof Client>[0]) {
        super(options);
        this.commands = new Collection();
    }

    async loadCommandsAndEvents() {
        const commands: Command[] = await Promise.all(readdirSync("./src/commands").map((file) => {
            return import(`../commands/${file}`);
        }));

        const events: Event[] = await Promise.all(readdirSync("./src/events").map((file) => {
            return import(`../events/${file}`);
        }));

        for (const command of commands) {
            if (command) {
                this.commands.set(command.name, command);
                logger.debug(`Loaded command: ${command.name}.`);
            }
        }

        for (const event of events) {
            if (event) {
                if (event.eventOnce) {
                    this.once(event.eventName, (...args) => event.execute(this, ...args));
                } else {
                    this.on(event.eventName, (...args) => event.execute(this, ...args));
                }

                logger.debug(`Loaded event: ${event.eventName}.`);
            }
        }
    }

    public async registerApplicationCommands() {
        if (!this.application?.commands) {
            logger.error("Client application or application commands are not available. Cannot register commands.");
            return;
        }

        const commandPayloads = this.commands
            .map(command => {
                if (!command.data || !command.execute) {
                    logger.warn(`Command '${command.name}' is missing the 'data' or 'execute' property and will not be registered.`);
                    return null;
                }
                return command.data as ApplicationCommandDataResolvable;
            })
            .filter(data => data !== null);

        if (commandPayloads.length === 0) {
            logger.info("No application commands with valid data found to register.");
            return;
        }

        const rest = new REST().setToken(Bun.env.DISCORD_TOKEN as string);
        const guildId = Bun.env.DISCORD_GUILD_ID;
        const clientId = Bun.env.DISCORD_APP_ID as string;


        try {
            if (guildId) {
                logger.info(`Registering ${commandPayloads.length} application command(s) for guild: ${guildId}.`);

                const data = await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commandPayloads },
                );

                logger.info(`Successfully reloaded ${(data as Array<any>).length} application (/) commands for guild: ${guildId}.`);
            } else {
                logger.info(`Registering ${commandPayloads.length} application command(s) globally.`);

                const data = await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commandPayloads },
                );

                logger.info(`Successfully registered ${(data as Array<any>).length} global application commands.`);
            }
        } catch (error) {
            logger.error("Failed to register application commands:", error);
        }
    }
}
