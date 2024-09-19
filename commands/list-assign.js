const { SlashCommandBuilder } = require('discord.js');
const { modifyItemProperty } = require('../utils/list-setters.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assign')
        .setDescription('Assigns a person to a specific item on the to-do list')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of the item to assign')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('assignee')
                .setDescription('The name of the person to assign to the item')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const channelId = interaction.channel.id;
        const number = interaction.options.getInteger('number');
        const assignee = interaction.options.getString('assignee');

        // Use the utility function to modify the 'assignee' property of the item
        await modifyItemProperty(interaction, channelId, number, 'assignee', assignee);
    },
};
