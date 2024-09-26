const { SlashCommandBuilder } = require('@discordjs/builders');
const scheduledScrimSchema = require('../models/scheduled-scrim-schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-reminder')
    .setDescription('Remove a scheduled reminder from the database based on role and channel')
    .addChannelOption(option => option.setName('channel').setDescription('The channel of the reminder to remove').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('The role of the reminder to remove').setRequired(true)),
  async execute(interaction) {
    const channelId = interaction.options.getChannel('channel').id;
    const roleId = interaction.options.getRole('role').id;

    try {
      // Find and remove the scrim based on channel and role
      const removedReminder = await scheduledScrimSchema.findOneAndRemove({ channel: channelId, role: roleId });

      if (removedReminder) {
        return interaction.reply({ content: 'Reminder removed from the database.', ephemeral: true });
      } else {
        return interaction.reply({ content: 'Reminder not found in the database.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error removing reminder:', error);
      return interaction.reply({ content: 'An error occurred while removing the reminder.', ephemeral: true });
    }
  }
};