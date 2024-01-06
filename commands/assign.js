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
            const auth = await google.auth.getClient({
                keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
            });

            const sheets = google.sheets({ version: 'v4', auth });
            const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

            const taskId = interaction.options.getString('id');
            const memberNickname = interaction.member.nickname || interaction.member.user.username;

            const sheetNames = ['Chassis', 'Controls', 'Drivetrain', 'Suspension', 'DAQ'];

            for (const sheetName of sheetNames) {
                const range = `${sheetName}!A:Z`;

                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                });

                const rows = response.data.values;

                const rowIndex = rows.findIndex(row => row[6] === taskId);

                if (rowIndex !== -1) {
                    await sheets.spreadsheets.values.update({
                        spreadsheetId,
                        range: `${sheetName}!E${rowIndex + 1}`, 
                        valueInputOption: 'RAW',
                        resource: {
                            values: [[memberNickname]],
                        },
                    });

                    interaction.reply(`${sheetName} task with ID ${taskId} assigned to ${memberNickname}.`);
                    return;
                }
            }

            interaction.reply(`Task with ID ${taskId} not found.`);
        } catch (error) {
            console.error('Error:', error);
        }
    },
};
