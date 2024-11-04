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

export default {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription('Support "Flan" developer project\'s?')
        
        .setDefaultMemberPermissions(0)
        .setDMPermission(null)
        .setNSFW(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        const paypal = '';
        const truewallet = '';
        const KPlus = ''; // Available on 'Thailand' ^^

        const SupportEmbedded = new EmbedBuilder()
            .setColor('Gold')
            .setTimestamp()
            .setImage(null) // Promotion for supporting

        await interaction.reply({
            content: `Thanks for supporting and using Flan bot...\n - Support via (Website)[https://www.notplai.net/project/flan]`,
            embeds: []
        });
    }
}