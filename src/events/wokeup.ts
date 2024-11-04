import { Client, Events } from "discord.js";

export default async (client: Client) => {
    client.on(Events.ClientReady, () => {
        console.info(`(FlanProject/WokeUp): ${client.user?.tag} online already now~!`)
    });
}