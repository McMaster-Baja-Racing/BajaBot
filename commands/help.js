const { SlashCommandBuilder } = require('discord.js');
const helpMessage = require('../assets/helpMessage.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Information'),
  async execute(interaction) {
    const user = interaction.user;

    const message = `
${helpMessage.intro.replace('{username}', user.username)}
${helpMessage.masterSheetLink}
${helpMessage.toDoLists}
${helpMessage.completeCommand}
${helpMessage.assignCommand}
`;

    user.send(message);

    await interaction.reply({ content: 'Nyaa~! I\'ve sent you instructions in your DMs, senpai! (*≧ω≦) Let\'s explore this kawaii to-do list together~ OwO 🌸💫', ephemeral: true });
  },
};
