const { google } = require('googleapis');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sheetdb')
        .setDescription('Google Sheets for todo'),

    async execute(interaction) {
        try {
            await interaction.reply({ content: "Fetching data from the spreadsheet...", ephemeral: true });

            const threadIds = {
                'Chassis': '1192481865056137247', //1192481865056137247
                'Controls': '1192508568927219773', //1192508568927219773
                'Drivetrain': '1192666172664053891', //1192666172664053891
                'Suspension': '1192708198881308772', //1192708198881308772
                'DAQ': '1192706895614582885',
            };

            const auth = await google.auth.getClient({
                keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });

            const sheets = google.sheets({ version: 'v4', auth });
            const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

            const responseEmbeds = [];

            const sheetColorMap = {
                'Chassis': 0x71368A, // purple
                'Controls': 0x1ABC9C, // turquoise
                'Drivetrain': 0xF1C40F, // yellow
                'Suspension': 0x2ECC71, // green
                'DAQ': 0x3498DB, // blue
            };

            for (const sheetName of Object.keys(threadIds)) {
                const range = sheetName;
            
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                });
            
                const sheetData = response.data.values.slice(1);
            
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const thisWeekStartDate = new Date(currentDate);
                const thisWeekEndDate = new Date(currentDate);
                thisWeekEndDate.setDate(currentDate.getDate() + (7 - currentDate.getDay()));
                
                const nextWeekStartDate = new Date(thisWeekEndDate);
                nextWeekStartDate.setDate(thisWeekEndDate.getDate() + 1);
                const nextWeekEndDate = new Date(nextWeekStartDate);
                nextWeekEndDate.setDate(nextWeekStartDate.getDate() + 7);
            
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
            
                const nextWeekTasks = sheetRows.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return (dueDate >= nextWeekStartDate && dueDate < nextWeekEndDate);
                });

                const thisWeekFormattedData = formatTasks(thisWeekTasks, sheetName, sheetColor, 'This Week');
                const nextWeekFormattedData = formatTasks(nextWeekTasks, sheetName, sheetColor, 'Next Week');

                responseEmbeds.push({ sheetName, formattedData: thisWeekFormattedData });
                responseEmbeds.push({ sheetName, formattedData: nextWeekFormattedData });
            }

            for (const { sheetName, formattedData } of responseEmbeds) {
                const threadId = threadIds[sheetName];
                if (threadId) {
                    const thread = await interaction.channel.threads.fetch(threadId);
                    if (thread) {
                        await thread.send({ embeds: [formattedData] });
                    } else {
                        console.error(`Thread not found for sheet: ${sheetName}`);
                    }
                } else {
                    console.error(`Thread ID not defined for sheet: ${sheetName}`);
                }
            }
        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
        }
    }
};

function formatTasks(tasks, sheetName, sheetColor, timeFrame) {
    const embed = new EmbedBuilder()
        .setColor(sheetColor)
        .setURL('https://docs.google.com/spreadsheets/d/1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI/edit#gid=490843265')
        .setAuthor({ name: 'To-Do Reminder', iconURL: 'https://i.imgur.com/ALT9CPo.jpg'})
        .setThumbnail('https://i.imgur.com/ALT9CPo.jpg')
        .setTitle(`${sheetName}: ${timeFrame}`)
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
