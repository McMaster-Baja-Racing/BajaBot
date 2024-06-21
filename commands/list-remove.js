const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const newListModule = require('./list-newlist.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes an item from the to-do list by its number')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of the item to remove')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        const channelId = interaction.channel.id;
        const number = interaction.options.getInteger('number');

        const list = newListModule.getList(channelId);

        if (!list || number < 1 || number > list.length) {
            return interaction.reply({ content: 'Invalid item number.', ephemeral: true });
        }

        list.splice(number - 1, 1);

        const embed = new EmbedBuilder()
            .setTitle('To Do List')
            .setDescription(list.length > 0 ? list.map((entry, index) => `${index + 1}. ${entry.item}`).join('\n') : 'This is your to-do list')
            .setColor(0x1e2124);

        const channel = interaction.channel;

        const messageId = newListModule.getMessageId(channelId);

        const message = await channel.messages.fetch(messageId);
        await message.edit({ embeds: [embed] });

        await interaction.reply({ content: 'Item removed from the list!', ephemeral: true });
    },
};
