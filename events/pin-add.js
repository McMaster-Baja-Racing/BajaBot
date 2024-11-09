const { Events } = require('discord.js');

const emoji = '📌';

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction) {
    if (reaction.emoji.name === emoji) {
      await reaction.message.pin();
    }
  }
};