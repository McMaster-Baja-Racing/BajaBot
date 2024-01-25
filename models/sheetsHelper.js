const { EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');

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

const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

module.exports = {
    formatTasks,
    calculateDates,
    authenticate,
    spreadsheetId,
    getTabs,
    buildThisWeekEmbed,
    buildNextWeekEmbed,
};