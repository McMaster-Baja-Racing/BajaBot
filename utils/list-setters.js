const { EmbedBuilder } = require('discord.js');
const newlist = require('../commands/list-newlist.js');

const modifyItemProperty = async (interaction, channelId, number, property, value) => {
    const list = newlist.getList(channelId);
    const messageId = newlist.getMessageId(channelId);

    if (!list) {
        return interaction.reply({ content: 'You need to create a list first using `/newlist`.', ephemeral: true });
    }

    if (number < 1 || number > list.length) {
        return interaction.reply({ content: 'Invalid item number.', ephemeral: true });
    }

    list[number - 1][property] = value;

    const embed = new EmbedBuilder()
        .setTitle('To Do List')
        .setDescription(list.map((entry, index) => `${index + 1}. ${entry.item}`).join('\n'))
        .setColor(0x1e2124);

    const channel = interaction.channel;

    const message = await channel.messages.fetch(messageId);
    await message.edit({ embeds: [embed] });

    await interaction.reply({ content: `Updated ${property} for item ${number}.`, ephemeral: true });
};

module.exports = {
    modifyItemProperty
};
