// This is broken currently
// Will change it to work with Google API listener instead of listening for a discord message

const { EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');
const { subteamData } = require('../models/data');

module.exports = {
  name: 'messageCreate',
  execute: async (message, client) => {
    console.log('Received message event:', message.content);

    if (message.author.id === client.user.id) {
      console.log('Message is from the bot.');

      // Check if the message contains 'task with ID' anywhere
      if (/task with ID/i.test(message.content)) {
        console.log('Message contains "task with ID".');

        const channelKeyword = getChannelKeyword(message.content);

        if (channelKeyword && subteamData[channelKeyword]) {

          const { thread: targetThreadId, color: sheetColor } = subteamData[channelKeyword];
          const targetThread = message.guild.channels.cache.get(targetThreadId);

          if (targetThread) {
            console.log(`Found hardcoded thread: ${targetThread.name}`);
            const messages = await targetThread.messages.fetch({ limit: 100 });
            const embedMessages = messages.filter((msg) => msg.author.id === client.user.id && msg.embeds.length > 0);

            console.log(`Found ${embedMessages.size} embed messages in ${targetThread.name}`);
            const embedMessagesArray = Array.from(embedMessages.values());
            console.log('Embed Messages Array:', embedMessagesArray);
            
            const sortedEmbeds = embedMessagesArray.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            
            const secondMostRecentEmbed = sortedEmbeds[1];

            if (secondMostRecentEmbed) {
              console.log(`Found second-to-last embed message in ${targetThread.name}`);
              const auth = await google.auth.getClient({
                keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
              });

              console.log('Authenticated with Google Sheets API');

              const sheets = google.sheets({ version: 'v4', auth });
              const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

              try {
                const sheetName = channelKeyword; 
                console.log(`Processing sheet: ${sheetName}`);
                const response = await sheets.spreadsheets.values.get({
                  spreadsheetId,
                  range: sheetName,
                });

                console.log(`Got response for sheet: ${sheetName}`);
                // Get a list of the names of all the columns
                const columns = sheetValuesResponse.data.values[0];
            
                const currentDate = new Date();
                const [thisWeekStartDate, thisWeekEndDate, nextWeekStartDate, nextWeekEndDate] = calculateDates(currentDate);
            
                // Create an array of task objects, each task object is basically a row of the spreadsheet, keys are column names
                const sheetRows = sheetData.map(row => {
                    const taskObject = {};
                    columns.forEach((columnName, index) => {
                        taskObject[columnName] = row[index];
                    });
                    return taskObject;
                });

                const thisWeekTasks = sheetRows.filter(row => {
                  const dueDate = new Date(row['Due Date']);
                  return (dueDate >= thisWeekStartDate && dueDate <= thisWeekEndDate);
              });

                console.log(`Processed sheet data for: ${sheetName}`);
                const updatedEmbed = formatTasks(thisWeekTasks, sheetName, sheetColor);
                await secondMostRecentEmbed.edit({ embeds: [updatedEmbed] });

                console.log(`Edited second-to-last embed for sheet "${sheetName}" in ${targetThread.name} thread.`);
              } catch (error) {
                console.error(`Error processing sheet ${sheetName}:`, error);
              }
            } else {
              console.log(`No embeds found in the bot's last 100 messages in ${targetThread.name} thread.`);
            }
          } else {
            console.log(`Hardcoded thread not found or not a GUILD_TEXT channel.`);
          }
        } else {
          console.log(`Channel keyword not recognized or corresponding data not found.`);
        }
      }
    }
  },
};

function getChannelKeyword(messageContent) {
  const match = messageContent.match(/\b(?:DAQ|Chassis|Drivetrain|Controls|Suspension)\b/i);
  return match ? match[0] : null;
}

function formatTasks(tasks, sheetName, sheetColor) {
  const embed = new EmbedBuilder()
    .setColor(sheetColor)
    .setURL('https://docs.google.com/spreadsheets/d/1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI/edit#gid=490843265')
    .setAuthor({ name: 'To-Do Reminder', iconURL: 'https://i.imgur.com/ALT9CPo.jpg' })
    .setThumbnail('https://i.imgur.com/ALT9CPo.jpg')
    .setTitle(`${sheetName}: This Week`)
    .addFields(
      tasks.map((row) => ({
        name: `__**${row.Task}**__`,
        value: `**Task ID:** ${row['ID']}\n> **Start Date:** ${row['Start Date']}\n> **Due Date:** ${row['Due Date']}\n> **Status:** ${row.Status}\n> **Assigned To:** ${row['Assigned To']}\n> **Notes:** ${row.Notes}`,
      }))
    )
    .setDescription( `Try to get these tasks done this week!` )
    .setFooter({text: 'Use /help for instructions on how to use this To-Do list!'});

  return embed;
}

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
