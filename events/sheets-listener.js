const { EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');
const { subteamData, excludedTabs } = require('../models/data');
const { formatTasks, calculateDates, authenticate, spreadsheetId, buildThisWeekEmbed, getTabs, processSheetData } = require('../models/sheetsHelper');

module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
    // Check if the interaction is a command
    if (!interaction.isCommand()) return;

    // Google authentication stuff
    const sheets = await authenticate();

    // Get the command
    const command = client.commands.get(interaction.commandName);

    console.log(`Command called: ${interaction.commandName}`);

    // Check if the commandName is either "assign" or "complete"
    if (interaction.commandName !== 'assign' && interaction.commandName !== 'complete') return;

    // Get the channel ID from the interaction
    const channelId = interaction.channelId;

    // Find the channel name associated with the channel ID
    const name = findNameByID(channelId);
    if (!name) {
      console.log('Sub-team not found in subteamData');
      return;
    }

    console.log('Associated SUB-TEAM Name:', name);

    // Fetch data from "MessageIDs" tab
    const range = "'Message IDs'!A:Z"; // Assuming the data is in columns A to Z--do this better w range or something
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Find the index of the header (name) in the first row
    const headerIndex = response.data.values[0].indexOf(name);

    if (headerIndex === -1) {
      console.log('Header not found in the "MessageIDs" tab.');
      return;
    }

    // Extract and log the data for the specified column
    const columnData = response.data.values.slice(1).map(row => row[headerIndex]);
    console.log('Data for column:', columnData);

    // Take the first data from the column
    const firstData = columnData[0];
    console.log('First Data:', firstData);

    // Search for the message with the first data (message ID) in the channel
    const message = await interaction.channel.messages.fetch(firstData);

    if (!message) {
      console.log(`Message with ID ${firstData} not found in the channel.`);
      return;
    }

    // Get a list of the names of the relevant tabs
    const responseTabs = await sheets.spreadsheets.get({ spreadsheetId });
    const tabs = await getTabs(responseTabs, name, excludedTabs);

    let edited;

    for (const tab of tabs) {
      const processedData = await processSheetData(sheets, tab);

      // Build this week embed
      edited = await processedData.thisWeekFormattedData;
    }

    // Replace the existing embed with the new one
    await message.edit({ embeds: [edited] });
    console.log(`Message with ID ${firstData} edited successfully.`);
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
