import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    ColorResolvable,
} from "discord.js";
import Vibrant from '@vibrant/core';
import fetch from 'node-fetch';

export default {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription('Invite "Flan" to another server or get support server...')
        
        .setDefaultMemberPermissions(0)
        .setDMPermission(null)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        const SupportGuild = interaction.client.guilds.cache.get('1299719387749814292');

        var Thumbnails = [(
            interaction.client.user.avatarURL()
         || interaction.client.user.displayAvatarURL()
        )];
        if (SupportGuild)
            Thumbnails.push(SupportGuild.iconURL()
         ?? (
                interaction.client.user.avatarURL()
             || interaction.client.user.displayAvatarURL()
            ));


        const ThumbnailIndex = getRandom(Thumbnails);
        // const EmbeddedColor = await getDominantColor(ThumbnailUrl);
        const EmbeddedColor = getRandom(
            [
                ['fdedc7', 'ee591d'],
                ['014d85', 'be1238', 'f8b721']
            ][ThumbnailIndex[1]]
        )[0];


        const InviteEmbedded = new EmbedBuilder()
        .setAuthor({ name: `Invited by **${SupportGuild?.members.cache.get('709727567120171008')?.user.username}**`,
            iconURL: SupportGuild?.members.cache.get('709727567120171008')?.avatarURL() ||  SupportGuild?.members.cache.get('709727567120171008')?.displayAvatarURL()
        })
        .setDescription(`
Invite [here](<https://discord.com/oauth2/authorize?client_id=1299331404647366656>).
Support Server [here](<https://youtu.be/dQw4w9WgXcQ?si=73IBbETtEnmNHpTF>).
`)      .setThumbnail(ThumbnailIndex[0])
        .setTimestamp()
        .setFooter({ text: `Inviting  request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() || interaction.user.displayAvatarURL() })
        .setColor(`#${EmbeddedColor}`)

        return await interaction.reply({
            embeds: [InviteEmbedded]
        });
    }
}

// Function to randomly select a hex color from any array
function getRandomHexColor(color: string[][]): string {
    // Select a random inner array
    const randomArray = color[Math.floor(Math.random() * color.length)];

    // Select a random color from the chosen array
    return randomArray[Math.floor(Math.random() * randomArray.length)];
}
function getRandom(array: any[]): [string, number] {
    let i = Math.floor(Math.random() * array.length);
    const randomArray = array[i];
    return [randomArray, i]
}

// async function getDominantColor(url: string): Promise<(ColorResolvable)> {
//     try {
//         const response = await fetch(url);
//         const buffer = await response.buffer();
//         const palette = await Vibrant.from(buffer).getPalette();

//         if (!palette.Vibrant) return "#FFFFFF";
//         return `#${palette.Vibrant.hex}`;
//     } catch (error) {
//         console.error("Error getting dominant color:", error);
//         return "#FFFFFF";
//     }
// }