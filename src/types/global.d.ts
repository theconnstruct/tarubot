import { Client, Collection, ApplicationCommandDataResolvable, type Interaction } from "discord.js";

export interface Command {
    name: string;
    data: ApplicationCommandDataResolvable;
    execute: (interaction: Interaction) => Promise<void> | void;
}

export interface Event {
    eventName: string;
    eventOnce: boolean;
    execute: (client: Client, ...args: any[]) => Promise<void> | void;
}
