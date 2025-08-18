const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdaysPath = path.join(__dirname, '..', 'assets', 'birthdays.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nextbday')
        .setDescription('Shows the next upcoming birthday(s)'),
    
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

            // Get current date
            const now = new Date();
            const currentYear = now.getFullYear();
            
            // Calculate next birthday for each person
            const upcomingBirthdays = birthdaysData.birthdays.map(birthday => {
                const birthdayThisYear = new Date(currentYear, birthday.month - 1, birthday.day);
                
                // If birthday already passed this year, consider next year
                if (birthdayThisYear < now) {
                    birthdayThisYear.setFullYear(currentYear + 1);
                }
                
                const daysUntil = Math.ceil((birthdayThisYear - now) / (1000 * 60 * 60 * 24));
                
                return {
                    username: birthday.username,
                    month: birthday.month,
                    day: birthday.day,
                    date: birthdayThisYear,
                    daysUntil: daysUntil
                };
            });

            // Sort by days until birthday
            upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

            // Find the next birthday(s) - might be multiple people on the same day
            const nextBirthdayDays = upcomingBirthdays[0].daysUntil;
            const nextBirthdays = upcomingBirthdays.filter(b => b.daysUntil === nextBirthdayDays);

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('🎂 Next Birthday(s)')
                .setTimestamp();

            if (nextBirthdayDays === 0) {
                // Today is someone's birthday!
                const names = nextBirthdays.map(b => b.username).join(', ');
                embed.setDescription(`🎉 **Today is ${names}'s birthday!** 🎉`);
                embed.setColor(0xFF6B9D);
            } else if (nextBirthdayDays === 1) {
                // Tomorrow
                const names = nextBirthdays.map(b => b.username).join(', ');
                embed.setDescription(`🎈 **Tomorrow is ${names}'s birthday!**`);
                embed.addFields({
                    name: 'Date',
                    value: `${getMonthName(nextBirthdays[0].month)} ${nextBirthdays[0].day}`,
                    inline: true
                });
            } else {
                // Future date
                const names = nextBirthdays.map(b => b.username).join(', ');
                embed.setDescription(`The next birthday is **${names}** in **${nextBirthdayDays} days**`);
                embed.addFields({
                    name: 'Date',
                    value: `${getMonthName(nextBirthdays[0].month)} ${nextBirthdays[0].day}`,
                    inline: true
                });
            }

            // Add upcoming birthdays list (next 5)
            const upcomingList = upcomingBirthdays.slice(0, 5).map(birthday => {
                const daysText = birthday.daysUntil === 0 ? 'Today!' : 
                                birthday.daysUntil === 1 ? 'Tomorrow' : 
                                `${birthday.daysUntil} days`;
                return `**${birthday.username}** - ${getMonthName(birthday.month)} ${birthday.day} (${daysText})`;
            }).join('\n');

            embed.addFields({
                name: 'Upcoming Birthdays',
                value: upcomingList || 'None found',
                inline: false
            });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching next birthday:', error);
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
