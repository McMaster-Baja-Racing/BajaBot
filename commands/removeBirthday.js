const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdaysPath = path.join(__dirname, '..', 'assets', 'birthdays.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removebirthday')
        .setDescription('Remove your birthday from the system'),
    
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Read existing birthdays
            if (!fs.existsSync(birthdaysPath)) {
                return await interaction.reply({
                    content: 'You don\'t have a birthday set!',
                    ephemeral: true
                });
            }

            const birthdaysData = JSON.parse(fs.readFileSync(birthdaysPath, 'utf8'));
            
            if (!birthdaysData.birthdays || birthdaysData.birthdays.length === 0) {
                return await interaction.reply({
                    content: 'You don\'t have a birthday set!',
                    ephemeral: true
                });
            }

            // Find user's birthday
            const userBirthdayIndex = birthdaysData.birthdays.findIndex(b => b.userId === userId);
            
            if (userBirthdayIndex === -1) {
                return await interaction.reply({
                    content: 'You don\'t have a birthday set!',
                    ephemeral: true
                });
            }

            // Remove the birthday
            const removedBirthday = birthdaysData.birthdays[userBirthdayIndex];
            birthdaysData.birthdays.splice(userBirthdayIndex, 1);

            // Save to file
            fs.writeFileSync(birthdaysPath, JSON.stringify(birthdaysData, null, 2));

            await interaction.reply({
                content: `Removed your birthday (${getMonthName(removedBirthday.month)} ${removedBirthday.day}) from the system! 😢`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error removing birthday:', error);
            await interaction.reply({
                content: 'There was an error removing your birthday. Please try again.',
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
