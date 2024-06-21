const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

let lists = {}; 
let messageIds = {}; 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newlist')
        .setDescription('Sends a to-do list')
        .addStringOption(option => 
            option.setName('name')
                  .setDescription('The name of the list')
                  .setRequired(false)
        ),
    async execute(interaction) {
        const channelId = interaction.channel.id;
        const listName = interaction.options.getString('name') || 'To Do List';

        lists[channelId] = []; 
        const embed = new EmbedBuilder()
            .setTitle(listName)
            .setDescription('This is your to-do list')
            .setColor(0x1e2124);

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        messageIds[channelId] = message.id;
    },

    getList: function(channelId) {
        return lists[channelId] || null;
    },

    getMessageId: function(channelId) {
        return messageIds[channelId] || null;
    },

    setList: function(channelId, newList) {
        lists[channelId] = newList;
    },

    setMessageId: function(channelId, newMessageId) {
        messageIds[channelId] = newMessageId;
    }
};
