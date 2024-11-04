import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";

function formatUptime(uptime: number) {
    const minutes = Math.floor(uptime / 60000);
    const days = Math.floor(minutes / 1440); // 1440 minutes in a day
    const hours = Math.floor((minutes % 1440) / 60);
    const remaining_minutes = minutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (remaining_minutes > 0) parts.push(`${remaining_minutes} minute${remaining_minutes > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(', ') : "Less than a minute";
}


export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Replies with Pong!')

        
        .setDefaultMemberPermissions(0)
        .setDMPermission(null)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {

        const sent = await interaction.reply({ content: `<a:minecraft_ping_bar:1299845170799313008> Pinging...`, ephemeral: true, fetchReply: true });
        
        const pinging = new EmbedBuilder()
        .setColor(interaction.user.hexAccentColor || interaction.guild?.members.cache.get(interaction.user.id)?.displayHexColor || "Orange")
        .setTitle("<:ping_pong_stick:1299844411127234570> Pong!")
        .setFields(
            [
                {
                    name: "<:sandglass:1299744131421175949> Uptime",
                    value: formatUptime(interaction.client.uptime),
                    inline: true
                },
                {
                    name: "<:plug_socket:1299744233120465057>  Websocket heartbeat",
                    value: [-1,0].includes(interaction.client.ws.ping) ? 'Initializing...' : `${interaction.client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: "<:inet_reround:1299743628226461788> Rountrip Latency",
                    value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`,
                    inline: true
                }
            ]
        )
        await interaction.editReply({
            content: null,
            embeds: [pinging]
        });
    }
}