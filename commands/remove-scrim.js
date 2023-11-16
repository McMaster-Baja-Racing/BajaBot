const { SlashCommandBuilder } = require('@discordjs/builders');
const scheduledScrimSchema = require('../models/scheduled-scrim-schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-scrim')
    .setDescription('Remove a scheduled scrim from the database based on role and channel')
    .addChannelOption(option => option.setName('channel').setDescription('The channel of the scrim to remove').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('The role of the scrim to remove').setRequired(true)),
  async execute(interaction) {
    const channelId = interaction.options.getChannel('channel').id;
    const roleId = interaction.options.getRole('role').id;

    try {
      // Find and remove the scrim based on channel and role
      const removedScrim = await scheduledScrimSchema.findOneAndRemove({ channel: channelId, role: roleId });

      if (removedScrim) {
        return interaction.reply({ content: 'Scrim removed from the database.', ephemeral: true });
      } else {
        return interaction.reply({ content: 'Scrim not found in the database.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error removing scrim:', error);
      return interaction.reply({ content: 'An error occurred while removing the scrim.', ephemeral: true });
    }
  }
};