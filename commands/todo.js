const { google } = require('googleapis');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { subteamData, excludedTabs } = require('../models/data'); // Colors and thread IDs for each tab, tabs to ignore

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
            const auth = await google.auth.getClient({
                keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';
            
            // Get a list of the names of all the tabs
            const response = await sheets.spreadsheets.get({ spreadsheetId });
            
            let tabs;
            if(subteamOption){
                // If subteamOption, tabs array will only have the one relevant tab
                const subteamTab = subteamOption.toLowerCase();
                const foundTab = response.data.sheets.find(sheet => sheet.properties.title.toLowerCase() === subteamTab);
                if (foundTab) {
                    tabs = [foundTab.properties.title];
                } else {
                    await interaction.reply({ content: `Subteam tab "${subteamOption}" not found.`, ephemeral: true });
                    return;
                }
            }else{
            // Filter out the excludedTabs (specified in ../models/data.js) from the list of tabs
            tabs = response.data.sheets
                .map(sheet => sheet.properties.title)
                .filter(tab => !excludedTabs.includes(tab));
            }

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

                // This week stuff
                const thisWeekTasks = sheetRows.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return (dueDate >= thisWeekStartDate && dueDate <= thisWeekEndDate);
                });

                // Next week stuff
                const nextWeekTasks = sheetRows.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return (dueDate >= nextWeekStartDate && dueDate < nextWeekEndDate);
                });

                // Format the embeds
                const thisWeekFormattedData = formatTasks(thisWeekTasks, tab, color, 'This Week', columns);
                const nextWeekFormattedData = formatTasks(nextWeekTasks, tab, color, 'Next Week', columns);

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
