const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chrono = require('chrono-node');

const birthdaysPath = path.join(__dirname, '..', 'assets', 'birthdays.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbirthday')
        .setDescription('Set your birthday using natural language (e.g., "March 15th", "tomorrow", "next Friday")')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Your birthday date in any format (e.g., "March 15th 1995", "15/03", "tomorrow")')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const dateInput = interaction.options.getString('date');

        try {
            // Parse the date using chrono-node
            const parsedDates = chrono.parse(dateInput);
            
            if (!parsedDates || parsedDates.length === 0) {
                return await interaction.reply({
                    content: 'Sorry, I couldn\'t understand that date format. Please try something like "March 15th", "15/03/1995", or "tomorrow".',
                    ephemeral: true
                });
            }

            const parsedDate = parsedDates[0].start.date();
            
            // For birthdays, we typically only care about month and day
            const month = parsedDate.getMonth() + 1; // getMonth() returns 0-11
            const day = parsedDate.getDate();
            
            // Read existing birthdays
            let birthdaysData = { birthdays: [] };
            if (fs.existsSync(birthdaysPath)) {
                const fileContent = fs.readFileSync(birthdaysPath, 'utf8');
                birthdaysData = JSON.parse(fileContent);
            }

            // Check if user already has a birthday set
            const existingIndex = birthdaysData.birthdays.findIndex(b => b.userId === userId);
            
            const birthdayEntry = {
                userId: userId,
                username: username,
                month: month,
                day: day,
                originalInput: dateInput,
                setDate: new Date().toISOString()
            };

            if (existingIndex !== -1) {
                // Update existing birthday
                birthdaysData.birthdays[existingIndex] = birthdayEntry;
                await interaction.reply({
                    content: `Updated your birthday to ${getMonthName(month)} ${day}! 🎂`,
                    ephemeral: true
                });
            } else {
                // Add new birthday
                birthdaysData.birthdays.push(birthdayEntry);
                await interaction.reply({
                    content: `Set your birthday to ${getMonthName(month)} ${day}! 🎂`,
                    ephemeral: true
                });
            }

            // Save to file
            fs.writeFileSync(birthdaysPath, JSON.stringify(birthdaysData, null, 2));

        } catch (error) {
            console.error('Error setting birthday:', error);
            await interaction.reply({
                content: 'There was an error setting your birthday. Please try again.',
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
