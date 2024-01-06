// This is admittedly really dumb but I couldn't think of a better way rn and I just wanted to get it working
// There's probably a better way

const { EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');

const threadIds = {
  'Chassis': '1192481865056137247',
  'Controls': '1192508568927219773',
  'Drivetrain': '1192666172664053891',
  'Suspension': '1192708198881308772',
  'DAQ': '1192706895614582885',
};

module.exports = {
  name: 'messageCreate',
  execute: async (message, client) => {
    console.log('Received message event:', message.content);

    if (message.author.id === client.user.id) {
      console.log('Message is from the bot.');

      if (message.content.includes('task with ID')) {
        console.log('Message contains "task with ID".');

        const channelKeyword = getChannelKeyword(message.content);

        if (channelKeyword && threadIds[channelKeyword]) {
          const targetThreadId = threadIds[channelKeyword];
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

              const responseEmbeds = [];

              const sheetColorMap = {
                'Chassis': 0x71368A,
                'Controls': 0x1ABC9C,
                'Drivetrain': 0xF1C40F,
                'Suspension': 0x2ECC71,
                'DAQ': 0x3498DB,
              };

              try {
                const sheetName = channelKeyword; 
                console.log(`Processing sheet: ${sheetName}`);
                const response = await sheets.spreadsheets.values.get({
                  spreadsheetId,
                  range: sheetName,
                });

                console.log(`Got response for sheet: ${sheetName}`);
                const sheetData = response.data.values.slice(1);
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const thisWeekStartDate = new Date(currentDate);
                const thisWeekEndDate = new Date(currentDate);
                thisWeekEndDate.setDate(currentDate.getDate() + (7 - currentDate.getDay()));

                const sheetRows = sheetData.map(row => ({
                  'Task': row[0],
                  'Start Date': row[1],
                  'Due Date': row[2],
                  'Status': row[3],
                  'Assigned To': row[4],
                  'Notes': row[5],
                  'ID': row[6],
                }));

                const sheetColor = sheetColorMap[sheetName];
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
          console.log(`Channel keyword not recognized or corresponding thread ID not found.`);
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
    .setFooter({ text: `Try to get these tasks done this week!` });

  return embed;
}
