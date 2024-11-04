import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    Guild,
    User
} from "discord.js";

function temporitly_banned(timout: number, fGuild: Guild, user: User) {
    setTimeout(() => {
        fGuild.members.unban(user.id);
    }, timout);
}

export default {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription('The ban command is moderator commands for ban user out of discord server')
        .addUserOption(which_user => which_user
            .setName('user')
            .setDescription("Which user want to kick?")

            .setRequired(true)
        )
        .addStringOption(deleteMessageAfter => deleteMessageAfter
            .setName('delete_message')
            .setDescription("How much of their recent message history to delete?")

            .setRequired(true)
            .addChoices(
                {
                    name: "Don't Delete Anything",
                    value: '0'
                },
                {
                    name: "Previous Hour",
                    value: '3600'
                },
                {
                    name: "Previous 6 Hours",
                    value: '21600'
                },
                {
                    name: "Previous 12 Hours",
                    value: '43200'
                },
                {
                    name: "Previous 24 Hours",
                    value: '86400'
                },
                {
                    name: "Previous 3 Days",
                    value: '259200'
                },
                {
                    name: "Previous 7 Days",
                    value: '604800'
                },
                
            )
        )

        .addStringOption(reason => reason
            .setName('reason')
            .setDescription("Have any reason want for kicking?")

            .setRequired(false)
            .setMinLength(1)
            .setMaxLength(200)
        )

        .addNumberOption(timeout => timeout
            .setName('seconds')
            .setDescription("Number of seconds for the ban timeout")

            .setRequired(false)
            .setMinValue(0)
        )
        .addNumberOption(timeout => timeout
            .setName('minutes')
            .setDescription("Number of minutes for the ban timeout")

            .setRequired(false)
            .setMinValue(0)
        )
        .addNumberOption(timeout => timeout
            .setName('hours')
            .setDescription("Number of hours for the ban timeout")

            .setRequired(false)
            .setMinValue(0)
        )
        .addNumberOption(timeout => timeout
            .setName('days')
            .setDescription("Number of days for the ban timeout")

            .setRequired(false)
            .setMinValue(0)
        )
        .addNumberOption(timeout => timeout
            .setName('months')
            .setDescription("Number of months for the ban timeout")

            .setRequired(false)
            .setMinValue(0)
        )
        .addNumberOption(timeout => timeout
            .setName('years')
            .setDescription("Number of years for the ban timeout")

            .setRequired(false)
            .setMinValue(0)
        )

        .setNSFW(false)
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async autoInteraction(client: Client, interaction: AutocompleteInteraction) {},
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return interaction.reply(
            {
                content: "Wait What!? How do you do that?...",
                ephemeral: true
            }
        );

        const datetime = Date.now();

        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', false) ?? 'Undefined Reason';
        const deleteMessagesAfter = Number(interaction.options.getString('delete_message', true));

        if (interaction.user.id === user.id) return;

        const s = interaction.options.getNumber('seconds', false) || 0;
        const m = interaction.options.getNumber('minutes', false) || 0;
        const h = interaction.options.getNumber('hours', false) || 0;
        const d = interaction.options.getNumber('days', false) || 0;
        const mo = interaction.options.getNumber('months', false) || 0;
        const y = interaction.options.getNumber('years', false) || 0;
        
        // Calculate total timeout in milliseconds
        const totalTimeout = (s * 1000) + (m * 60000) + (h * 3600000) + (d * 86400000) + (mo * 2592000000) + (y * 31536000000);

        const BannedEmbedded = new EmbedBuilder()
        .setAuthor({ name: `Banned by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() || interaction.user.displayAvatarURL() })
        .setColor(interaction.user.hexAccentColor || interaction.guild?.members.cache.get(interaction.user.id)?.displayHexColor || "Orange")
        .setTimestamp(datetime)
        .setFooter({ text: `User-Id: ${user.id}` })
        .setThumbnail(user.avatarURL() || user.displayAvatarURL())
        .setFields(
            {
                name: "Username",
                value: user.username,
                inline: true
            },
            {
                name: "User ID",
                value: user.id,
                inline: true
            },
            {
                name: "Banned Date",
                value: new Date(datetime).toISOString(),
                inline: true
            },
            {
                name: "Reason for",
                value: reason,
                inline: true
            }
        )

        // Ban the user with the calculated timeout
        if (totalTimeout > 0) {
            await interaction.guild.members.ban(user.id, { reason: `Temporarily Banned\nReason: ${reason}\nBanned by ${interaction.user.username}`, deleteMessageSeconds: deleteMessagesAfter });

            // Convert the timestamp to a readable date and time format (optional)
            const futureDate = new Date(datetime + totalTimeout);
            futureDate

            temporitly_banned(totalTimeout, interaction.guild, user);

            BannedEmbedded.addFields(  
                {
                    name: "Pardon Date",
                    value: futureDate.toISOString(),
                    inline: true
                }
            )

            return await interaction.reply({
                embeds: [BannedEmbedded]
            });
        }

        // Permantly Banned
        await interaction.guild.members.ban(user.id, { reason: `Permantly Banned\nReason: ${reason}\nBanned by ${interaction.user.username}`, deleteMessageSeconds: deleteMessagesAfter });

        BannedEmbedded.addFields(  
            {
                name: "Permantly Banned",
                value: "True",
                inline: true
            }
        )

        return await interaction.reply({
            embeds: [BannedEmbedded]
        });
        
    }
}