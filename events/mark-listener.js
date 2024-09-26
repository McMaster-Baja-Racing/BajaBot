const { Events } = require('discord.js');
const uwus = require('../assets/uwus.json'); 

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        const users = uwus.users;
        const channelId = '1022004325326782494';

        if (message.channel.id === channelId && users[message.author.id]) {
            const userMessages = users[message.author.id];
            const randomMessage = userMessages[Math.floor(Math.random() * userMessages.length)];
            message.reply(randomMessage);
        }
    },
};
