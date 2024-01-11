const { google } = require('googleapis');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { subteamData } = require('../models/data'); // Colors and thread IDs for each tab

module.exports = {
    data: new SlashCommandBuilder()
        .setName('todo')
        .setDescription('Sends to-do lists for each subteam to their respective forum threads.'),

    async execute(interaction) {
        try {

            // Send silly little secret message to show you that it is doing something I guess
            await interaction.reply({ content: "Fetching data from the spreadsheet...", ephemeral: true });

            // Google authentication stuff
            const auth = await google.auth.getClient({
                keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';
            
            // Get a list of the names of all the tabs
            const response = await sheets.spreadsheets.get({spreadsheetId,});
            const tabs = response.data.sheets.map(sheet => sheet.properties.title);

            const responseEmbeds = [];

            // Iterate over the tabs
            for (const tab of tabs) {

                const range = tab;

                const threadID = subteamData[tab].thread; // Use threadID from ../models/data.js
                const color = subteamData[tab].color; // Use color from ../models/data.js
            
                const sheetValuesResponse = await sheets.spreadsheets.values.get({spreadsheetId, range,});
                const sheetData = sheetValuesResponse.data.values.slice(1);
                
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
            
                const nextWeekTasks = sheetRows.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return (dueDate >= nextWeekStartDate && dueDate < nextWeekEndDate);
                });

                const thisWeekFormattedData = formatTasks(thisWeekTasks, tab, color, 'This Week');
                const nextWeekFormattedData = formatTasks(nextWeekTasks, tab, color, 'Next Week');

                responseEmbeds.push({ tab, formattedData: thisWeekFormattedData });
                responseEmbeds.push({ tab, formattedData: nextWeekFormattedData });
            }

            for (const { tab, formattedData } of responseEmbeds) {
                const threadID = subteamData[tab].thread;
                if (threadID) {
                    const forumThread = await interaction.channel.threads.fetch(threadID); 
                    if (forumThread) {
                        await forumThread.send({ embeds: [formattedData] });
                    } else {
                        console.error(`Thread not found for sheet: ${tab}`);
                    }
                } else {
                    console.error(`Thread ID not defined for sheet: ${tab}`);
                }
            }
        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
        }
    }
};

function formatTasks(tasks, tab, color, timeFrame) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setURL('https://docs.google.com/spreadsheets/d/1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI/edit#gid=490843265')
        .setAuthor({ name: 'To-Do Reminder', iconURL: 'https://i.imgur.com/ALT9CPo.jpg'})
        .setThumbnail('https://i.imgur.com/ALT9CPo.jpg')
        .setTitle(`${tab}: ${timeFrame}`)
        .addFields(
            tasks.map(row => ({
                name: timeFrame.toLowerCase() === 'next week' ? '\u200B' : `__**${row.Task}**__`,
                value: timeFrame.toLowerCase() === 'next week' ? `       ${row.Task}       ` : `**Task ID:** ${row['ID']}\n> **Start Date:** ${row['Start Date']}\n> **Due Date:** ${row['Due Date']}\n> **Status:** ${row.Status}\n> **Assigned To:** ${row['Assigned To']}\n> **Notes:** ${row.Notes}`,
                inline: timeFrame.toLowerCase() === 'next week',
            }))
        )
        .setDescription( timeFrame.toLowerCase() === 'next week' ? `Prepare to get these tasks done next week!` : `Try to get these tasks done ${timeFrame.toLowerCase()}!` )
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
