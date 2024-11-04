import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription('The kick command is moderator commands for kick user out of discord server')
        .addUserOption(which_user => which_user
            .setName('user')
            .setDescription("Which user want to kick?")

            .setRequired(true)
        )
        .addStringOption(reason => reason
            .setName('reason')
            .setDescription("Have any reason want for kicking?")

            .setRequired(false)
            .setMinLength(1)
            .setMaxLength(200)
        )

        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply(
            {
                content: "Wait What!? How do you do that?...",
                ephemeral: true
            }
        );

        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', false) ?? 'Undefined Reason';

        if (interaction.user.id === user.id) return;

        interaction.guild.members.kick(user, reason);
    }
}