const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthdayhelp')
        .setDescription('Shows help for birthday commands'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🎂 Birthday Commands Help')
            .setDescription('Here are all the birthday-related commands you can use:')
            .addFields(
                {
                    name: '📅 `/setbirthday <date>`',
                    value: 'Set your birthday using natural language!\n**Examples:**\n• `March 15th`\n• `15/03/1995`\n• `tomorrow`\n• `next Friday`\n• `December 25`',
                    inline: false
                },
                {
                    name: '🔍 `/nextbday`',
                    value: 'Shows the next upcoming birthday(s) and a list of upcoming birthdays',
                    inline: false
                },
                {
                    name: '📋 `/listbirthdays`',
                    value: 'Shows all birthdays organized by month in chronological order',
                    inline: false
                },
                {
                    name: '❌ `/removebirthday`',
                    value: 'Remove your birthday from the system',
                    inline: false
                },
                {
                    name: '🤖 Automatic Birthday Alerts',
                    value: 'The bot automatically checks for birthdays every day at 9 AM and will post birthday messages for anyone celebrating!',
                    inline: false
                }
            )
            .setFooter({ text: 'BajaBot Birthday System - Powered by natural language processing!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
