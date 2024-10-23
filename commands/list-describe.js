const { SlashCommandBuilder } = require('discord.js');
const { modifyItemProperty } = require('../utils/list-setters.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('describe')
        .setDescription('Adds or updates the description of a specific item on the to-do list')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of the item to describe')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('The description of the item')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        const channelId = interaction.channel.id;
        const number = interaction.options.getInteger('number');
        const description = interaction.options.getString('description');

        await modifyItemProperty(interaction, channelId, number, 'description', description);
    },
};
