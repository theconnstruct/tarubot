import { Events } from "discord.js";
import { TaruBot } from "../tarubot";

export const eventName = Events.Error;
export const eventOnce = false;

export async function execute(client: TaruBot, error: Error) {
    console.error("An error occurred: ", error);
}