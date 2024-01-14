const { google } = require('googleapis');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('complete')
        .setDescription('Mark a task as completed using the Task ID.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The ID of the task to mark as complete.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            // Google authentication stuff
            const auth = await google.auth.getClient({
                keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

            // Get the ID
            const taskId = interaction.options.getString('id');

            // Get a list of the names of all the tabs
            const response = await sheets.spreadsheets.get({ spreadsheetId });
           
            // Filter out the 'Message IDs' tab from the list of tabs
            const tabs = response.data.sheets
                .map(sheet => sheet.properties.title)
                .filter(tab => tab !== 'Message IDs');

            for (const tab of tabs) {
                const range = `${tab}!A:Z`;

                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                });

                const rows = response.data.values;

                // Find the column index of 'ID'
                const headerRow = rows[0];
                const idColumnIndex = headerRow.findIndex(header => header.toLowerCase() === 'id');

                if (idColumnIndex !== -1) {
                    const rowIndex = rows.findIndex(row => row[idColumnIndex] === taskId);

                    if (rowIndex !== -1) {
                        await sheets.spreadsheets.values.update({
                            spreadsheetId,
                            range: `${tab}!D${rowIndex + 1}`,
                            valueInputOption: 'RAW',
                            resource: {
                                values: [['Completed']],
                            },
                        });
                    
                        // Confirmation message
                        await interaction.reply(`${tab} task with ID ${taskId} marked as completed.`);
                        return;
                    }
                }
            }

            await interaction.reply(`Task with ID ${taskId} not found.`);
        } catch (error) {
            console.error('Error:', error);
        }
    },
};
