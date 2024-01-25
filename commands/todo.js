const { google } = require('googleapis');
const { SlashCommandBuilder } = require('discord.js');
const { subteamData, excludedTabs } = require('../models/data'); // Colors and thread IDs for each tab, tabs to ignore
const { formatTasks, calculateDates, authenticate, spreadsheetId, getTabs, buildThisWeekEmbed, buildNextWeekEmbed } = require('../models/sheetsHelper'); 


module.exports = {
    data: new SlashCommandBuilder()
        .setName('todo')
        .setDescription('Sends to-do lists for each subteam to their respective forum threads.')
        .addStringOption(option =>
            option.setName('subteam')
                .setDescription('(Optional) specify one subteam to update reminders for.')
                .setRequired(false)),

    async execute(interaction) {
        const subteamOption = interaction.options.getString('subteam');

        try {
            // Send silly little secret message to show you that it is doing something I guess
            await interaction.reply({ content: "Fetching data from the spreadsheet...", ephemeral: true });
            
            // Google authentication stuff
            const sheets = await authenticate();

            // Get a list of the names of the relevant tabs
            const response = await sheets.spreadsheets.get({ spreadsheetId });
            const tabs = await getTabs(response, subteamOption, excludedTabs);

            // To store embeds the bot will send
            const responseEmbeds = [];

            // Iterate over the tabs
            for (const tab of tabs) {

                const range = tab;
                const threadID = subteamData[tab].thread; // Use threadID from ../models/data.js
                const color = subteamData[tab].color; // Use color from ../models/data.js

                const sheetValuesResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });
                const sheetData = sheetValuesResponse.data.values.slice(1);

                // Get a list of the names of all the columns
                const columns = sheetValuesResponse.data.values[0];

                // Date calculations
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

            // Build this week embed
            const thisWeekFormattedData = await buildThisWeekEmbed(tab, color, columns, sheetRows, thisWeekStartDate, thisWeekEndDate);

            // Build next week embed
            const nextWeekFormattedData = await buildNextWeekEmbed(tab, color, columns, sheetRows, nextWeekStartDate, nextWeekEndDate);

            // Push to array of response embeds
            responseEmbeds.push({ tab, formattedData: thisWeekFormattedData });
            responseEmbeds.push({ tab, formattedData: nextWeekFormattedData });
            }

            // Send the embeds to the appropriate thread
            let currentRow = 2; // Initialize the current row to 2 for the second row

            for (const { tab, formattedData } of responseEmbeds) {
                const threadID = subteamData[tab].thread;
                if (threadID) {
                    const forumThread = await interaction.channel.threads.fetch(threadID);
                    if (forumThread) {
                        const sentMessage = await forumThread.send({ embeds: [formattedData] });
            
                        // Log the message ID
                        console.log(`Message ID for ${tab}: ${sentMessage.id}`);
            
                        // Find the column index corresponding to the 'tab'
                        const columnIndex = response.data.sheets.findIndex(sheet => sheet.properties.title === tab);
            
                        if (columnIndex !== -1) {
                            // Get the column letter (A, B, C, ...)
                            const columnLetter = String.fromCharCode('A'.charCodeAt(0) + columnIndex);
            
                            // Build the range to update with the current row
                            const rangeToUpdate = `Message IDs!${columnLetter}${currentRow}`;
            
                            // Build the values to update
                            const valuesToUpdate = [[sentMessage.id]];
            
                            // Update the spreadsheet
                            await sheets.spreadsheets.values.update({
                                spreadsheetId,
                                range: rangeToUpdate,
                                valueInputOption: 'RAW',
                                resource: { values: valuesToUpdate },
                            });
            
                            // Alternate between the second and third rows for the next iteration
                            currentRow = currentRow === 2 ? 3 : 2;
                        } else {
                            console.error(`Column index not found for sheet: ${tab}`);
                        }
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
