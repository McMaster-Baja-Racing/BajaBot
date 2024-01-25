const { EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');
const { subteamData } = require('../models/data');

module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
    // Check if the interaction is a command
    if (!interaction.isCommand()) return;

    // Google authentication stuff
    const auth = await google.auth.getClient({
      keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

    // Get the command
    const command = client.commands.get(interaction.commandName);

    console.log(`Command called: ${interaction.commandName}`);

    // Check if the commandName is either "assign" or "complete"
    if (interaction.commandName === 'assign' || interaction.commandName === 'complete') {
      // Get the channel ID from the interaction
      const channelId = interaction.channelId;

      // Find the channel name associated with the channel ID
      const name = findNameByID(channelId);
      if (name) {
        console.log('Associated SUB-TEAM Name:', name);

        // Fetch data from "MessageIDs" tab
        const range = "'Message IDs'!A:Z"; // Assuming the data is in columns A to Z in the "MessageIDs" tab
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        // Find the index of the header (name) in the first row
        const headerIndex = response.data.values[0].indexOf(name);

        if (headerIndex !== -1) {
          // Extract and log the data for the specified column
          const columnData = response.data.values.slice(1).map(row => row[headerIndex]);
          console.log('Data for column:', columnData);

          // Take the first data from the column
          const firstData = columnData[0];
          console.log('First Data:', firstData);

          // Search for the message with the first data (message ID) in the channel
          const message = await interaction.channel.messages.fetch(firstData);

          if (message) {
            // Edit the embed

            edited = new EmbedBuilder()
              .setTitle("IDK")
              .toJSON();
            // Replace the existing embed with the new one
            await message.edit({ embeds: [edited] });
            console.log(`Message with ID ${firstData} edited successfully.`);
          } else {
            console.log(`Message with ID ${firstData} not found in the channel.`);
          }
        } else {
          console.log('Header not found in the "MessageIDs" tab.');
        }
      } else {
        console.log('Sub-team not found in subteamData');
      }
    }
  }
};

const findNameByID = (channelId) => {
  for (const tab in subteamData) {
    const threadId = subteamData[tab].thread;
    if (threadId === channelId) {
      return tab;
    }
  }
  return null;
};

// Builds the embeds
function formatTasks(tasks, tab, color, timeFrame, columns) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setURL('https://docs.google.com/spreadsheets/d/1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI/edit#gid=490843265')
    .setAuthor({ name: 'To-Do Reminder', iconURL: 'https://i.imgur.com/ALT9CPo.jpg' })
    .setThumbnail('https://i.imgur.com/ALT9CPo.jpg')
    .setTitle(`${tab}: ${timeFrame}`)
    .addFields(
      tasks.map(row => {
        const field = {
          name: timeFrame.toLowerCase() === 'next week' ? '\u200B' : `__**${row.Task}**__`,
          value: timeFrame.toLowerCase() === 'next week' ? `       ${row.Task}       ` : '',
          inline: timeFrame.toLowerCase() === 'next week',
        };

        columns.forEach(columnName => {
          if (columnName !== 'Task' && timeFrame.toLowerCase() === 'this week') {
            field.value += `> **${columnName}:** ${row[columnName]}\n`;
          }
        });

        return field;
      })
    )
    .setDescription(timeFrame.toLowerCase() === 'next week' ? `Prepare to get these tasks done next week!` : `Try to get these tasks done ${timeFrame.toLowerCase()}!`)
    .setFooter({ text: 'Use /help for instructions on how to use this To-Do list!' });

  return embed;
}

// Calculates dates for this week/next week stuff
function calculateDates(currentDate) {
  currentDate.setHours(0, 0, 0, 0);

  const thisWeekStartDate = new Date(currentDate);

  const thisWeekEndDate = new Date(currentDate);
  thisWeekEndDate.setDate(currentDate.getDate() + (7 - currentDate.getDay()));

  const nextWeekStartDate = new Date(thisWeekEndDate);
  nextWeekStartDate.setDate(thisWeekEndDate.getDate() + 1);

  const nextWeekEndDate = new Date(nextWeekStartDate);
  nextWeekEndDate.setDate(nextWeekStartDate.getDate() + 7);

  return [thisWeekStartDate, thisWeekEndDate, nextWeekStartDate, nextWeekEndDate];
}