import { EndBehaviorType, joinVoiceChannel } from "@discordjs/voice";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
    Encoding,
    GuildMember,
    User
} from "discord.js";

import { Readable } from "node:stream";
import { SpeechClient } from "@google-cloud/speech";
const S2TClient = new SpeechClient();

export default {
    data: new SlashCommandBuilder()
        .setName("s2t")
        .setDescription('Speak2Text on voice chat to recording or make a subtitle.')
        .addChannelOption(where => where
            .setName("where")
            .setDescription("Where channel I prefer to join?")
            .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)

            .setRequired(false)
        )


        .setDefaultMemberPermissions(0)
        .setDMPermission(null)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        return interaction.reply({
            content: "Now is function & command is under-development~, can you waiting for release? ^^",
            ephemeral: true
        });
        
        // if (!interaction.guild) return interaction.reply(
        //     {
        //         content: "Wait What!? How do you do that?...",
        //         ephemeral: true
        //     }
        // );

        // const channel = interaction.options.getChannel('where', false) ?? interaction.guild.members.cache.get(interaction.user.id)?.voice.channel;

        // if (!channel) return interaction.reply({
        //     content: `You must be in a voice channel or specify one to use this command.`,
        //     ephemeral: true 
        //  });

        // const connection = joinVoiceChannel({
        //     channelId: channel.id,
        //     guildId: interaction.guild.id,
        //     adapterCreator: interaction.guild.voiceAdapterCreator,

        //     selfDeaf: false,
        //     selfMute: true,
        // });

        // const receiver = connection.receiver;

        // await interaction.deferReply({
        //     ephemeral: false,
        //     fetchReply: true
        // });

        // receiver.speaking.on('start', userId => {
        //     const audioStream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence,  duration: 100 }});

        //     const user: User | undefined = interaction.guild?.members.cache.get(userId)?.user;
        //     if (!user) return interaction.followUp({
        //         content: `TypeError: user is undefine...`,
        //         ephemeral: true
        //     })

        //     processAudioStream(audioStream).catch(error => {
        //         console.error('Error in transcription: ', error);
        //         return interaction.followUp({
        //             'content': "Error in transcription, please try again...",
        //             ephemeral: true
        //         });
        //     }).then(transcriptions => {
        //         interaction.followUp(`> ${user.username} said "${transcriptions}"`);
        //     })
        // })
    }
}

// async function processAudioStream(audioStream: Readable): Promise<string> {
//     const audioData: any = []

//     audioStream.on('data', chunk => audioData.push(chunk));

//     return new Promise((res, rej) => {
//         audioStream.on('end', async () => {
//             const transcription = await Speech2TextAPI(audioData);
//             res(transcription)
//         });
//     });
// }

// async function Speech2TextAPI(audioData: Buffer, simpleBitRate: number = 16000, languageCode: string = "en-US", encoding: "MP3" | "ENCODING_UNSPECIFIED" | "LINEAR16" | "FLAC" | "MULAW" | "AMR" | "AMR_WB" | "OGG_OPUS" | "SPEEX_WITH_HEADER_BYTE" | "WEBM_OPUS" | null | undefined = "LINEAR16"): Promise<string> {
//     const audioBytes = audioData.toString('base64');

//     const req = {
//         audio: {
//             content: audioBytes
//         },
//         config: {
//             encoding: encoding,
//             sampleRateHertz: simpleBitRate,
//             languageCode: languageCode
//         }
//     };

//     const [res] = await S2TClient.recognize(req);

//     const transcription = res.results
//     ?.map(result => result.alternatives?.[0]?.transcript || '')
//     .filter(transcription => transcription)
//     .join('\n') || ''

//     return transcription
// }