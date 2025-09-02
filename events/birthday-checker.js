const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdaysPath = path.join(__dirname, '..', 'assets', 'birthdays.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        // Check birthdays immediately on startup
        checkBirthdays(client);
        
        // Schedule birthday checks every day at 9 AM
        const scheduleNextCheck = () => {
            const now = new Date();
            const nextCheck = new Date();
            nextCheck.setHours(9, 0, 0, 0); // 9 AM
            
            // If it's past 9 AM today, schedule for tomorrow
            if (now >= nextCheck) {
                nextCheck.setDate(nextCheck.getDate() + 1);
            }
            
            const msUntilNextCheck = nextCheck.getTime() - now.getTime();
            
            setTimeout(() => {
                checkBirthdays(client);
                scheduleNextCheck(); // Schedule the next check
            }, msUntilNextCheck);
            
            console.log(`Next birthday check scheduled for ${nextCheck.toLocaleString()}`);
        };
        
        scheduleNextCheck();
    },
};

async function checkBirthdays(client) {
    try {
        if (!fs.existsSync(birthdaysPath)) {
            return;
        }

        const birthdaysData = JSON.parse(fs.readFileSync(birthdaysPath, 'utf8'));
        
        if (!birthdaysData.birthdays || birthdaysData.birthdays.length === 0) {
            return;
        }

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        // Find today's birthdays
        const todaysBirthdays = birthdaysData.birthdays.filter(birthday => 
            birthday.month === currentMonth && birthday.day === currentDay
        );

        if (todaysBirthdays.length === 0) {
            return;
        }

        console.log(`Found ${todaysBirthdays.length} birthday(s) today:`, todaysBirthdays.map(b => b.username));

        // Create birthday message
        const names = todaysBirthdays.map(birthday => `<@${birthday.userId}>`).join(', ');
        
        const embed = new EmbedBuilder()
            .setColor(0xFF6B9D)
            .setTitle('🎉 Happy Birthday! 🎉')
            .setDescription(`Today is ${names}'s birthday!\n\n🎂 Hope you have a wonderful day! 🎂`)
            .setThumbnail('https://media.tenor.com/kHcmsw5F5CAAAAAC/cake-happy-birthday.gif')
            .setTimestamp()
            .setFooter({ text: 'BajaBot Birthday Wishes' });

        // Send birthday message to all channels the bot has access to
        // You might want to configure specific channels for birthday announcements
        const guilds = client.guilds.cache;
        
        for (const guild of guilds.values()) {
            // Find a suitable channel (general, announcements, or first text channel)
            const channel = 
                guild.channels.cache.find(ch => ch.name.includes('general') && ch.isTextBased()) ||
                guild.channels.cache.find(ch => ch.name.includes('announcement') && ch.isTextBased()) ||
                guild.channels.cache.find(ch => ch.isTextBased());
            
            if (channel && channel.permissionsFor(client.user).has(['SendMessages', 'EmbedLinks'])) {
                try {
                    await channel.send({ 
                        content: `🎉 **BIRTHDAY ALERT!** 🎉\n${names}`,
                        embeds: [embed] 
                    });
                    console.log(`Sent birthday message to ${guild.name} - #${channel.name}`);
                } catch (error) {
                    console.error(`Failed to send birthday message to ${guild.name}:`, error);
                }
            }
        }

    } catch (error) {
        console.error('Error checking birthdays:', error);
    }
}
