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
} from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayer } from '@discordjs/voice';

import { Buffer } from "node:buffer";

// Google be models for t2s
// - repo version:
//   - 'googleTTS' variable for "first" module I still use;
//   - 'googleT2S' variable for "renewed" for change vtone;
import * as googleTTS from 'google-tts-api';
import GoogleT2S from'@google-cloud/text-to-speech';
import { google } from "@google-cloud/text-to-speech/build/protos/protos";
import internal from "node:stream";

const GoogleClientT2S = new GoogleT2S.TextToSpeechClient();
// async function GoogleSynthesize(text: string, language: string, ssml_gender: ("SSML_VOICE_GENDER_UNSPECIFIED" | "MALE" | "FEMALE" | "NEUTRAL" | null | undefined)): Promise<Buffer<ArrayBuffer> | void> {
    
//     const request: requestTTS = {
//         input: { text: text },
//         voice: { languageCode: language, ssmlGender: ssml_gender },
//         audioConfig: { audioEncoding: "MP3" },
//     }

//     const [response] = await GoogleClientT2S.synthesizeSpeech(request);
//     if (typeof response.audioContent === 'string') {
//         return Buffer.from(response.audioContent, 'base64');
//     }
//     else if (response.audioContent instanceof Uint8Array) {
//         return Buffer.from(response.audioContent);
//     }
// };

const GoogleSynthesize = async (text: string, language: string, ssml_gender: ("SSML_VOICE_GENDER_UNSPECIFIED" | "MALE" | "FEMALE" | "NEUTRAL" | null | undefined)): Promise<Buffer> => {
    return new Promise(async (res, rej) => {
        const request: requestTTS = {
            input: { text: text },
            voice: { languageCode: language, ssmlGender: ssml_gender },
            audioConfig: { audioEncoding: "MP3" },
        }

        const [response] = await GoogleClientT2S.synthesizeSpeech(request);
        if (typeof response.audioContent === 'string') {
            res(Buffer.from(response.audioContent, 'base64'));
        }
        else if (response.audioContent instanceof Uint8Array) {
        }
        
    });
}

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

function getValue(object: {name: string, value: string}[], k: any): string | undefined {
    const v = object.find(item => item.name === k);
    return v ? v.value : undefined;
};
function getKey(object: { name: string, value: string }[], v: any): string | undefined {
    const k = object.find(item => item.value === v);
    return k ? k.name : undefined;
};



export default {
    data: new SlashCommandBuilder()
        .setName("t2s")
        .setDescription('TextToSpeak commands!')
        .addStringOption(t2s => t2s
            .setRequired(true)

            .setName('text')
            .setDescription("Which text want to text in channel?")
            .setMinLength(1).setMaxLength(200)
        )
        .addChannelOption(where => where
            .setName("where")
            .setDescription("Where channel I prefer to join?")
            .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)

            .setRequired(false)
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
            .setDescription("which prefer Model-TTS want to using? (default: \"GoogleTTS\")")

            .setChoices(
                ModelTTSObjectArray
            )
        )
        
        .setDefaultMemberPermissions(PermissionFlagsBits.SendTTSMessages)
        .setDMPermission(null)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply(
            {
                content: "Wait What!? How do you do that?...",
                ephemeral: true
            }
        );

        const text = interaction.options.getString('text', true);
        const language = interaction.options.getString('language', false) ?? 'en-US';
        const channel = interaction.options.getChannel('where', false) ?? interaction.guild.members.cache.get(interaction.user.id)?.voice.channel;

        const modelTTS = interaction.options.getString('model_tts', false) ?? 'GoogleTTS-Model';

        if (!channel) return interaction.reply({
           content: `You must be in a voice channel or specify one to use this command.`,
           ephemeral: true 
        });

        const player = createAudioPlayer();
        var contentAudioResource;

        await interaction.deferReply({
            ephemeral: false,
            fetchReply: true,
        });

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

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,

            selfDeaf: true,
            selfMute: false
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

        await interaction.editReply({
            embeds: [FlanTTSEmbedded],
        });

        let disconnectTimeout: number | NodeJS.Timeout;
        player.addListener("stateChange", (oldState, newState) => {
            // If the player goes idle, set a 5-second timeout to disconnect
            if (newState.status === "idle") {
                connection.disconnect();
            }
        });

    }
}