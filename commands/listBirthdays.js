const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdaysPath = path.join(__dirname, '..', 'assets', 'birthdays.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listbirthdays')
        .setDescription('Shows all birthdays in chronological order'),
    
    async execute(interaction) {
        try {
            // Read birthdays data
            if (!fs.existsSync(birthdaysPath)) {
                return await interaction.reply({
                    content: 'No birthdays have been set yet! Use `/setbirthday` to add yours.',
                    ephemeral: true
                });
            }

            const birthdaysData = JSON.parse(fs.readFileSync(birthdaysPath, 'utf8'));
            
            if (!birthdaysData.birthdays || birthdaysData.birthdays.length === 0) {
                return await interaction.reply({
                    content: 'No birthdays have been set yet! Use `/setbirthday` to add yours.',
                    ephemeral: true
                });
            }

            // Sort birthdays chronologically (by month, then day)
            const sortedBirthdays = birthdaysData.birthdays.sort((a, b) => {
                if (a.month !== b.month) return a.month - b.month;
                return a.day - b.day;
            });

            // Group by month
            const birthdaysByMonth = {};
            sortedBirthdays.forEach(birthday => {
                const monthName = getMonthName(birthday.month);
                if (!birthdaysByMonth[monthName]) {
                    birthdaysByMonth[monthName] = [];
                }
                birthdaysByMonth[monthName].push(birthday);
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('🎂 All Birthdays')
                .setDescription(`Total: ${sortedBirthdays.length} birthday${sortedBirthdays.length !== 1 ? 's' : ''}`)
                .setTimestamp();

            // Add fields for each month that has birthdays
            for (const [monthName, birthdays] of Object.entries(birthdaysByMonth)) {
                const birthdayList = birthdays
                    .sort((a, b) => a.day - b.day) // Sort by day within the month
                    .map(birthday => `**${birthday.username}** - ${monthName} ${birthday.day}`)
                    .join('\n');
                
                embed.addFields({
                    name: `📅 ${monthName}`,
                    value: birthdayList,
                    inline: true
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error listing birthdays:', error);
            await interaction.reply({
                content: 'There was an error fetching birthday information. Please try again.',
                ephemeral: true
            });
        }
    },
};

function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
}
