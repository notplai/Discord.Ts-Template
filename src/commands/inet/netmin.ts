import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    APIEmbedField
} from "discord.js";

// NetTools External Modules
import net from 'net';
import ping from 'ping';
import ip from 'ip';

import { exec } from 'child_process';
function whichPort(ip: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const command = `nmap -p- ${ip}`; // -p- scans all ports (1-65535)

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing nmap: ${stderr}`);
                return;
            }

            // Return the scan results
            resolve(stdout);
        });
    });
}


export default {
    data: new SlashCommandBuilder()
        .setName("netmin")
        .setDescription('inet is network uitilies commands like nettools but for available for special members only...')

        .addSubcommand(portstatus => portstatus
            .setName('portstatus')
            .setDescription('portstatus is port status checker for checking open port useful testing port forwarding on a router.')

            .addIntegerOption(device_id => device_id
                .setName('device_id')
                .setDescription("Local device id? get from '/netmin get device'")
                .setRequired(true)

                .setMinValue(1)
                .setMaxValue(255)
            )
    
            .addIntegerOption(portn => portn
                .setName('port_number')
                .setDescription('Port number to checking like: 22, 80, 443, etc.')
                .setRequired(true)
    
                .setMinValue(0).setMaxValue(65535)
            )
        )
        
        .addSubcommandGroup(get => get
            .setName('get')
            .setDescription('Get information of local...')
            .addSubcommand(device => device
                .setName('device')
                .setDescription('Get device on lan network... including ID for other netmin commands.')
                .addIntegerOption(deviceSubnet => deviceSubnet
                    .setName('device_subnet')
                    .setDescription('used "subnet[3]" like 192.168.1.4 as 4 or if you insert like "-4" is can list "subnet[3]" 0 to 4')
                    .setMinValue(-255)
                    .setMaxValue(255)

                    .setRequired(true)
                )
                .addBooleanOption(hide_offline => hide_offline
                    .setName('display_offline')
                    .setDescription("Display Offline status when used 'get' commands on nagative number. (Default: False)")

                    .setRequired(false)
                )
            )
        )
        
        .setDefaultMemberPermissions(0)
        .setDMPermission(true)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        // Bot thinking...
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        });

        const cgroups = interaction.options.getSubcommandGroup(false);
        const csubs = interaction.options.getSubcommand(true);

        if (!cgroups && csubs) {
            
            switch (csubs) {

                case "portstatus":
                    const device_id = interaction.options.getInteger("device_id", true);
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
            
                    const result = await checkPort(`192.168.1.${device_id}`, port);
                    const portEmbedded = new EmbedBuilder()
                    .setDescription(`## Port Checker Result\n - Checking Port **${port}** on **192.168.1.${device_id}**...`)
                    .setColor(result ? "Green" : "DarkRed")
                    .addFields(
                        {
                            name: "Status",
                            value: `Port **${port}** is **${result ? 'open. ^^' : 'closed. T^T'}**.`
                        }
                    )
            
                    return interaction.editReply(
                        {
                            embeds: [portEmbedded]
                        }
                    );
                    
            }


        } else if (cgroups) {
            if (cgroups === 'get') {
                switch (csubs) {
                    case "device":
                        const subnet_i4 = interaction.options.getInteger('device_subnet', true);
                        const display_offline = interaction.options.getBoolean('display_offline', false) ?? false;

                        if (subnet_i4 === 0) return interaction.editReply({
                                content: "device subnet index 4 cannot be zero..."
                            });

                        let scanLAN = async (subnet: string, subnet_i4: number, unavailable_display?: boolean): Promise<ping.PingResponse | ping.PingResponse[]> => {

                            if (subnet_i4 < 0) {
                                subnet_i4 *= -1

                                const promises = [];

                                for (let i = 1; i <= subnet_i4; i++) {
                                    promises.push(ping.promise.probe(`${subnet}.${i}`));
                                }
                            
                                let res = await Promise.all(promises);
                                if (unavailable_display) return res;
                                else return res.filter(result => result.alive);

                            } else {
                                return await ping.promise.probe(`${subnet}.${subnet_i4}`);
                            }
                        }

                        const loinet = (ip.subnet(ip.address(), '255.255.255.0').networkAddress).split('.');


                        const subnet = `${loinet[0]}.${loinet[1]}.${loinet[2]}`
                        const LANstatus = await scanLAN(subnet, subnet_i4, display_offline);

                        const Inet_Embed = new EmbedBuilder()
                        .setTimestamp()
                        .setColor(interaction.user.hexAccentColor || interaction.guild?.members.cache.get(interaction.user.id)?.displayHexColor || "Orange");

                        if (Array.isArray(LANstatus)) {
                            Inet_Embed
                            .setDescription(`
\`\`\`ansi
${LANstatus.map(res => `[1;37m[1;42m  Address: ${res.host} [1;37m[2;40m ${res.alive?"[1;32mOnline ":"[1;31mOffline"} [1;37m deviceId: [2;36m${res.host.split('.')[3]}  `).join('\n')}
\`\`\`
`)

                            return interaction.editReply({
                                embeds: [Inet_Embed]
                            });
                            
                        } else {
                            if (!LANstatus.alive)return interaction.editReply({
                                    content: `${LANstatus.host} still offline...\nCannot contact to it...`
                                });
                        

                            Inet_Embed.setAuthor({
                                name: `${LANstatus.host}`
                            })
                            .setDescription(`
\`\`\`bash
---------- Ping Details of ${LANstatus.host} ----------
Maximum: ${LANstatus.max} // PacketLoss: ${Number(LANstatus.packetLoss)*100}% 
Average: ${LANstatus.avg} // Time: ${LANstatus.time}% 
Minimum: ${LANstatus.min} // Stddev: ${LANstatus.stddev}% 
---------- Port Details of ${LANstatus.host} ----------
${(await whichPort(LANstatus.host).catch((rej) => rej))}
\`\`\`
`)
                                .setFields(
                                    {
                                        name: "Device-Id",
                                        value: `${LANstatus.host.split('.').at(-1)}`,
                                        inline: true
                                    },
                                    {
                                        name: "Status",
                                        value: `is **${LANstatus.alive ? "Online" : "Offline"}**`,
                                        inline: true
                                    }
                                )
                            return interaction.editReply({
                                embeds: [Inet_Embed]
                            });

                        }
                }
            }
        }
    }
}