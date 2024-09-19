const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const newListModule = require('./list-newlist.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds an item to the to-do list')
        .addStringOption(option => 
            option.setName('item')
                  .setDescription('The item to add to the list')
                  .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('description')
                  .setDescription('The description of the item')
                  .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('assignee')
                  .setDescription('The person assigned to the item')
                  .setRequired(false)
        ),

    async execute(interaction) {
        const channelId = interaction.channel.id;
        
        const item = interaction.options.getString('item');
        const description = interaction.options.getString('description') || 'No description';
        const assignee = interaction.options.getString('assignee') || 'Unassigned';

        const list = newListModule.getList(channelId);
        const messageId = newListModule.getMessageId(channelId);
        
        if (!list) {
            return interaction.reply('You need to create a list first using `/newlist`.');
        }

        const number = list.length + 1;

        list.push({ item, description, assignee });

        const embed = new EmbedBuilder()
            .setTitle('To Do List')
            .setDescription(list.map((entry, index) => `${index + 1}. ${entry.item}`).join('\n'))
            .setColor(0x1e2124);

        const channel = interaction.channel;
        const message = await channel.messages.fetch(messageId);
        await message.edit({ embeds: [embed] });

        await interaction.reply({ content: 'Item added to the list!', ephemeral: true });
    },
};
