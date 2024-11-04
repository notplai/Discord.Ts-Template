const dictionary_BaseURL = 'https://api.dictionaryapi.dev/api/v2/entries';
const httpErrorObject_BaseURL = 'https://http.dog';

import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("dictionary")
        .setDescription('Open dictionary?')
        .addStringOption(which_word => which_word
            .setName("word")
            .setDescription("Which word you want to find definitions in dictionary?")

            .setRequired(true)
        )

        .addStringOption(language => language
            .setName("langauge")
            .setDescription("Which language you want to find definitions? (normally is \"English\")")
            .addChoices(
                {
                    name: "English",
                    value: "en"
                }
            )

            .setRequired(false)
        )
        
        .setDefaultMemberPermissions(0)
        .setDMPermission(null)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        // Bot thinking...
        await interaction.deferReply({
            ephemeral: false,
            fetchReply: true
        });

        const word = interaction.options.getString('word', true);
        const langauge = interaction.options.getString('langauge', false) ?? 'en';

        const response = await fetch(`${dictionary_BaseURL}/${langauge}/${word}`);
        // const contentType = response.headers.get("content-type");
        // if (contentType && contentType.includes("application/json")) {
        //     let data = await response.json();
        //     console.info(data);
        // }
        // else {
        //     let data = await response.text();
        //     console.error(data)
        // }
        

        if (!response.ok) {

            let HTTPErrorEmbedded = new EmbedBuilder()
                .setColor(response.status)
                .setImage(`${httpErrorObject_BaseURL}/${response.status}.jpg`)

                .setDescription(`HTTP/HTTPS is Not Responsing... **${response.status}: ${response.statusText}**`)
                .addFields(
                    {
                        name: "Response Status",
                        value: `${response.status}`,
                        inline: true
                    },
                    {
                        name: "Response Status Text",
                        value: `${response.statusText}`,
                        inline: true
                    }
                );

            return await interaction.editReply({
                embeds: [HTTPErrorEmbedded]
            });
        };

        const data = await response.json();
        console.info(data)

        const definition = new EmbedBuilder()
            .setDescription(`Word Definition is \`${data[0]["word"]}\`, phonetic as \`${data[0]["phonetics"][0]}\`\nIn meanings is **${data[0]["meanings"][0]["definitions"][0]["definition"]}**`)
            .addFields(
                {
                    name: "License",
                    value: data[0]["license"]["name"],
                    inline: true
                }
            )

            .setFooter({
                text: `SourceUrls: ${data[0]["sourceUrls"][0]}`,
                iconURL: interaction.user.avatarURL() || interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({
            embeds: [definition]
        });
        
    }
}