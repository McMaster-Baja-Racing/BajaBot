const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Information'),
  async execute(interaction) {
    const user = interaction.user;

    const message = `
## Hello ${user.username}! Here are some instructions for using the To-Do lists:

[The master google sheet for all the To-Dos can be found here](https://docs.google.com/spreadsheets/d/1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI/edit#gid=822610725).
- You can also access this by clicking on the blue title of any To-Do notification from the bot.

### To-Do Lists
- The bot will send a to-do list for your sub-team in the To-Do thread (in your sub-team's forum).
- One message will have tasks due this week, with all associated information such as start date, due date, status, etc.
- **Every task will have a 'Task ID'. The first two letters indicate the subteam it belongs to. You will need to use this ID to complete or self-assign to a task.**

### /complete [id]

- This will mark a task as complete. 
- It updates the status of the task in the master google sheet, and also edits the bot's 'This Week' message to mark the appropriate task as completed.

### /assign [id]

- This will assign you to a task. 
- You can only assign yourself to the task. It will add your nickname on the server to the master google sheet as the assignee, and will also update the bot's 'This Week' message to mark you down for it.
`;

    user.send(message);

    await interaction.reply({ content: 'Nyaa~! I\'ve swent youw instwuctions in yuw DMs, senpai! (*≧ω≦) Let\'s expwowe this kawaii to-do list togethew~ OwO 🌸💫', ephemeral: true });
  },
};