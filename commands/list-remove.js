const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const newListModule = require('./list-newlist.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('View details of a specific item on the to-do list')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of the item to view')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        const channelId = interaction.channel.id;
        const number = interaction.options.getInteger('number');

        const list = newListModule.getList(channelId);

        if (!list || number < 1 || number > list.length) {
            return interaction.reply({ content: 'Invalid item number.', ephemeral: true });
        }

        const item = list[number - 1];

        const embed = new EmbedBuilder()
            .setTitle(`Item ${number}: ${item.item}`)
            .setDescription(item.description)
            .setColor(0x1e2124);

        if (item.assignee) {
            embed.addFields({ name: 'Assignee', value: item.assignee, inline: true });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
