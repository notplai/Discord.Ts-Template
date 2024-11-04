import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder
} from "discord.js";

// NetTools External Modules
import net from 'net';

// Validate the host
function validateHost(host: string): boolean {
    // Regular expression to match 192.168.x.x
    const localIPPattern = /^192\.168\.\d{1,3}\.\d{1,3}$/;

    // Check for localhost and local IP range
    return (host === 'localhost' || localIPPattern.test(host) ? false : true);
    // if (host === 'localhost' || localIPPattern.test(host)) {
    //     throw new Error(`Access denied: Cannot operate on localhost or local IP (${host})`);
    // }
}

export default {
    data: new SlashCommandBuilder()
        .setName("nettools")
        .setDescription('nettools is network uitilies commands...')

        .addSubcommand(portstatus => portstatus
            .setName('portstatus')
            .setDescription('portstatus is port status checker for checking open port useful testing port forwarding on a router.')

            .addStringOption(pubaddr => pubaddr
                .setName('target_host')
                .setDescription("Your Public DNS or IP Address")
                .setRequired(true)
            )
    
            .addIntegerOption(portn => portn
                .setName('port_number')
                .setDescription('Port number to checking like: 22, 80, 443, etc.')
                .setRequired(true)
    
                .setMinValue(0).setMaxValue(65535)
            )
        )
        
        .setDefaultMemberPermissions(0)
        .setDMPermission(null)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        const host = interaction.options.getString("target_host", true);
        if (!validateHost(host)) return await interaction.reply({
            content: `Access denied: Cannot operate on localhost or local IP (${host})`,
            ephemeral: true,
        });


        // Bot thinking...
        await interaction.deferReply({
            ephemeral: false,
            fetchReply: true
        });

        const cgroups = interaction.options.getSubcommandGroup(false);
        const csubs = interaction.options.getSubcommand(true);

        if (!cgroups && csubs) {
            
            switch (csubs) {

                case "portstatus":
                    const port = interaction.options.getInteger('port_number', true);

                    const checkPort = (host: string, port: number) => {
                        return new Promise((res, rej) => {
                            const socket = new net.Socket();
            
                            // Set a timeout for the connection attempt.
                            socket.setTimeout(3000);
            
                            socket.on('connect', () => {
                                socket.destroy();
                                res(true);
                            });
            
                            socket.on('timeout', () => {
                                socket.destroy();
                                res(false);
                            });
            
                            socket.on('error', () => {
                                socket.destroy();
                                res(false);
                            });
            
                            socket.connect(port, host);
                        });
                    };
            
                    const result = await checkPort(host, port);
                    const portEmbedded = new EmbedBuilder()
                    .setDescription(`## Port Checker Result\n - Checking Port **${port}** on **${host}**...`)
                    .setColor(result ? "Green" : "DarkRed")
                    .addFields(
                        {
                            name: "Status",
                            value: `Port **${port}** is **${result ? 'open. ^^' : 'closed. T^T'}**.`
                        }
                    )
            
                    await interaction.editReply(
                        {
                            embeds: [portEmbedded]
                        }
                    );
            }


        }
    }
}