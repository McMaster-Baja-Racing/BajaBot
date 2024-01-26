const { google } = require('googleapis');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assign')
        .setDescription('Assign yourself to a task using the Task ID.')
        .addStringOption(option =>
            option.setName('id') 
                .setDescription('The ID of the task you want to self-assign.')
                .setRequired(true)),

    async execute(interaction) {
        try {
            // Defer the reply to ensure the interaction is not considered expired
            // It was expiring and not sending the discord message confirmation so this is to prevent that
            await interaction.deferReply();

            // Google authentication stuff
            const auth = await google.auth.getClient({
                keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

            // Get the server nickname of the person who called the command
            const taskId = interaction.options.getString('id');
            const memberNickname = interaction.member.nickname || interaction.member.user.username;

            // Get a list of the names of all the tabs
            const response = await sheets.spreadsheets.get({ spreadsheetId });

            // Filter out the 'Message IDs' tab from the list of tabs
            const tabs = response.data.sheets
                .map(sheet => sheet.properties.title)
                .filter(tab => tab !== 'Message IDs');

            for (const tab of tabs) {
                const range = tab;

                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                });

                const rows = response.data.values;

                // Find the column index of 'Assigned To'
                const headerRow = rows[0];
                const assignedToColumnIndex = headerRow.findIndex(header => header.toLowerCase() === 'assigned to');

                if (assignedToColumnIndex !== -1) {
                    const rowIndex = rows.findIndex(row => row[6] === taskId);

                    if (rowIndex !== -1) {
                        await sheets.spreadsheets.values.update({
                            spreadsheetId,
                            range: `${tab}!${String.fromCharCode(65 + assignedToColumnIndex)}${rowIndex + 1}`, 
                            valueInputOption: 'RAW',
                            resource: {
                                values: [[memberNickname]],
                            },
                        });

                        // Confirmation message
                        await interaction.editReply(`${tab} task with ID ${taskId} assigned to ${memberNickname}.`);
                        return;
                    }
                }
            }
            await interaction.editReply(`Task with ID ${taskId} not found.`);
        } catch (error) {
            console.error('Error:', error);
        }
    },
};
