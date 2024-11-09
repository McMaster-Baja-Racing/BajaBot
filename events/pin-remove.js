const { Events } = require('discord.js');

const emoji = '📌';

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction) {
    if (reaction.emoji.name === emoji) {
      await reaction.message.unpin();
    }
  },
};