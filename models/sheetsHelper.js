const { EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');
const { subteamData, excludedTabs } = require('../models/data'); // Colors and thread IDs for each tab, tabs to ignore

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

// Authenticates with Google
async function authenticate() {
    try {
        const auth = await google.auth.getClient({
            keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });

        return google.sheets({ version: 'v4', auth });
    } catch (error) {
        console.error('Error authenticating with Google Sheets:', error);
        throw error;
    }
}

// Gets relevant tabs, filters out the ones to exclude, if subteamOption only gets the one relevant tab
const getTabs = async (response, subteamOption, excludedTabs) => {
    if (subteamOption) {
        const subteamTab = subteamOption.toLowerCase();
        const foundTab = response.data.sheets.find(sheet => sheet.properties.title.toLowerCase() === subteamTab);
        if (foundTab) {
            return [foundTab.properties.title];
        } else {
            throw new Error(`Subteam tab "${subteamOption}" not found.`);
        }
    } else {
        return response.data.sheets
            .map(sheet => sheet.properties.title)
            .filter(tab => !excludedTabs.includes(tab));
    }
};

// Builds 'This Week' embed
async function buildThisWeekEmbed(tab, color, columns, sheetRows, thisWeekStartDate, thisWeekEndDate) {
    const thisWeekTasks = sheetRows.filter(row => {
        const dueDate = new Date(row['Due Date']);
        return (dueDate >= thisWeekStartDate && dueDate <= thisWeekEndDate);
    });

    return formatTasks(thisWeekTasks, tab, color, 'This Week', columns);
}
 
// Builds 'Next Week' embed
async function buildNextWeekEmbed(tab, color, columns, sheetRows, nextWeekStartDate, nextWeekEndDate) {

    const nextWeekTasks = sheetRows.filter(row => {
        const dueDate = new Date(row['Due Date']);
        return (dueDate >= nextWeekStartDate && dueDate < nextWeekEndDate);
    });

    return formatTasks(nextWeekTasks, tab, color, 'Next Week', columns);
}

// sheet id
const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

// handles processing stuff from the sheet to build the embeds
async function processSheetData(sheets, tab) {
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

    return { tab, thisWeekFormattedData, nextWeekFormattedData };
}

module.exports = {
    formatTasks,
    calculateDates,
    authenticate,
    spreadsheetId,
    getTabs,
    buildThisWeekEmbed,
    buildNextWeekEmbed,
    processSheetData,
};