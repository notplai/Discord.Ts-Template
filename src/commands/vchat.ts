import { requestTTS } from "./types/tts";

import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    VoiceBasedChannel,
} from "discord.js";
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';

import * as googleTTS from 'google-tts-api';


function getValue(object: {name: string, value: string}[], k: any): string | undefined {
    const v = object.find(item => item.name === k);
    return v ? v.value : undefined;
};
function getKey(object: { name: string, value: string }[], v: any): string | undefined {
    const k = object.find(item => item.value === v);
    return k ? k.name : undefined;
};

// T2S Models & Assets
const languageCode = [
    {
        name: 'Thai',
        value: "th-TH"
    },
    {
        name:'English (US)',
        value: "en-US"
    }
]
const ModelTTSLists = [
    "GoogleTTS-Model",
    "GoogleTTS-Renewed-Model",
    "MoeTTS-Model",
    "AnimeTTS-JA-Model",
    "AnimeTTS-Multilanguage-Model",
];
const ModelTTS2Indexes = {
    "GoogleTTS-Model": 0,
    "GoogleTTS-Renewed-Model": 1,
    "MoeTTS-Model": 2,
    "AnimeTTS-JA-Model": 3,
    "AnimeTTS-Multilanguage-Model": 4,
};
const ModelTTSObjectArray = [
    {
        name: 'GoogleTTS Model',
        value: ModelTTSLists[0]
    },
    {
        name: 'GoogleTTS Renewed Model',
        value: ModelTTSLists[1]
    },
    {
        name: 'MoeTTS Model',
        value: ModelTTSLists[2]
    },
    {
        name: 'AnimeTTS JA Model',
        value: ModelTTSLists[3]
    },
    {
        name: 'AnimeTTS Mutilanguages Model',
        value: ModelTTSLists[4]
    },
];


export default {
    data: new SlashCommandBuilder()
        .setName("voicechat")
        .setDescription('VoiceChat Group Commands!')
        .addSubcommand(ping => ping
            .setName("ping")
            .setDescription("Pinging WebSocket and UDP Port Latency from voice chat.")
        )
        .addSubcommand(join => join
            .setName("join")
            .setDescription("join command for allows some command on Flan.")

            .addChannelOption(prefer => prefer
                .setName("prefer")
                .setDescription("Voice Chat prefer join?")
                .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)

                .setRequired(false)
            )
        )
        .addSubcommand(leave => leave
            .setName("leave")
            .setDescription("disconnect Flan from this guild party?")

            .addBooleanOption(breakQueue => breakQueue
                .setName("destroy")
                .setDescription("destory queue after left? (Default: True)")
            )
        )

        .addSubcommand(t2s => t2s
            .setName('t2s')
            .setDescription("Text to Speech like Narrator.")
            .addStringOption(message => message
                .setRequired(true)
    
                .setName('message')
                .setDescription("Which message want to speak out in channel?")
                .setMinLength(1).setMaxLength(200)
            )
            .addStringOption(language => language
                .setName("language")
                .setDescription('Which language want to speak out? (default: \'English\')')
                .setChoices(
                    languageCode
                )
            )
            .addStringOption(model => model
                .setName("model_tts")
                .setDescription("which prefer using Model-TTS? (default: \"GoogleTTS\")")
    
                .setChoices(
                    ModelTTSObjectArray
                )
            )
        )
        
        .setDefaultMemberPermissions(0)
        .setDMPermission(false)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply(
            {
                content: "Wait What!? How do you do that?...",
                ephemeral: true
            }
        );

        const subcommand = interaction.options.getSubcommand(true);

        if (subcommand === 'join') {
            const voiceChat: VoiceBasedChannel | null | undefined = interaction.options.getChannel('prefer', false) ?? interaction.guild.members.cache.get(interaction.user.id)?.voice.channel;

            if (!voiceChat) return interaction.reply({
                content: `You must be in a voice channel or specify one to use this command.`,
                ephemeral: true 
            });

            joinVoiceChannel({
                channelId: voiceChat.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
    
                selfDeaf: true,
                selfMute: false
            });

            return interaction.reply({
                content: `You invited me to your party? ^^\n> Hope, I can make this party happier someway~!`,
                ephemeral: true
            });
        }
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) return interaction.reply({content: "You must be in a voice channel or specify one to use this command.", ephemeral: true});

        await interaction.deferReply({
            ephemeral: false,
            fetchReply: true,
        });

        if (subcommand === 'ping') {
            const pinging = new EmbedBuilder()
            .setColor(interaction.user.hexAccentColor || interaction.guild?.members.cache.get(interaction.user.id)?.displayHexColor || "Orange")
            .setTitle("<:ping_pong_stick:1299844411127234570> Pong!")
            .setFields(
                [
                    {
                        name: "<:plug_socket:1299744233120465057> Websocket heartbeat",
                        value: `${connection.ping.ws} ms`,
                        inline: true
                    },
                    {
                        name: "<:inet_reround:1299743628226461788> UDP Latency",
                        value: `${connection.ping.udp} ms`,
                        inline: true
                    }
                ]
            )
            return interaction.editReply({
                content: null,
                embeds: [pinging]
            });
        }
        else if (subcommand === 't2s') {
            const text = interaction.options.getString('message', true);
            const language = interaction.options.getString('language', false) ?? 'en-US';
            const modelTTS = interaction.options.getString('model_tts', false) ?? 'GoogleTTS-Model';

            const player = createAudioPlayer();
            var contentAudioResource;

            if (modelTTS === ModelTTSLists[0]) {
                contentAudioResource = googleTTS.getAudioUrl(text, { lang: language, slow: false });
            }
            // else if (modelTTS === ModelTTSLists[1]) {
            //     let base64Audio = await GoogleSynthesize(text, language, "NEUTRAL")
            //     if (base64Audio instanceof Buffer) contentAudioResource = base64Audio;
            // }
            else return await interaction.editReply({
                content: `Sorry, but the **${modelTTS.replace(/-/g, ' ')}** of ModelTTS is currently unsupported, please stay tuned for its release! **T^T**`
            });

            if ( typeof contentAudioResource !== 'string') return;
            const resource = createAudioResource(contentAudioResource);

            player.play(resource);
            connection.subscribe(player);

            const FlanTTSEmbedded = new EmbedBuilder()
                .setAuthor({
                    name: `Text by ${interaction.user.username}`,
                    iconURL: interaction.user.avatarURL() || interaction.user.displayAvatarURL()
                })
                .setColor(interaction.user.hexAccentColor || interaction.guild.members.cache.get(interaction.user.id)?.displayHexColor || "Orange")
                // .setFooter({
                //     text: `FlanTTS written by ${NotPlaiProfile?.user.username}`,
                //     iconURL: NotPlaiProfile?.avatarURL() || NotPlaiProfile?.displayAvatarURL()
                // })
                .setFields(
                    {
                        name: "ModelTTS",
                        value: `${modelTTS.split('-')[0]}`,
                        inline: true
                    },
                    {
                        name: "Language",
                        value: `${getKey(languageCode, language)}`,
                        inline: true
                    },
                    {
                        name: "InQueue",
                        value: `No queue setup`,
                        inline: true
                    },
                    {
                        name: "Messages",
                        value: `${text}`,
                        inline: true
                    }
                )
                .setTimestamp()

            return interaction.editReply({
                embeds: [FlanTTSEmbedded],
            });
        }

        else if (subcommand === 'leave') {
            let adapterAvailable = interaction.options.getBoolean("destroy", false) ?? true;

            connection.destroy(adapterAvailable)
            return interaction.editReply({
                content: `I disconnected from your party alr, Seeya~ ^^`
            });
        }
    }
}