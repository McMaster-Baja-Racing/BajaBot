const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sheetdb')
        .setDescription('sheet db for todo'),

    async execute(interaction) {
        try {
            await interaction.reply({ content: "Fetching data from the spreadsheet...", ephemeral: true });

            const sheetNames = ['Chassis', 'Controls', 'Drivetrain', 'Suspension', 'DAQ'];

            // Array to store messages for each tab
            const responseMessages = [];

            for (const sheetName of sheetNames) {
                const response = await axios.get(`https://sheetdb.io/api/v1/trx2ey55em789?sheet=${sheetName}`);

                // Date stuff
                const currentDate = new Date();
                const thisWeekStartDate = new Date(currentDate);
                thisWeekStartDate.setHours(0, 0, 0, 0);
                thisWeekStartDate.setDate(currentDate.getDate() - currentDate.getDay());
                const nextWeekStartDate = new Date(thisWeekStartDate);
                nextWeekStartDate.setDate(thisWeekStartDate.getDate() + 7);

                const sheetData = response.data.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return dueDate >= thisWeekStartDate && dueDate < nextWeekStartDate;
                });

                const formattedData = sheetData.map(row => `**Subteam:** ${row.Subteam}\n**Task:** ${row.Task}\n**Due Date:** ${row['Due Date']}\n**Status:** ${row.Status}\n**Assigned To:** ${row['Assigned To']}\n**Notes:** ${row.Notes}`).join('\n\n');

                if (formattedData.length > 0) {
                    responseMessages.push(`**Items for ${sheetName}:**\n\n${formattedData}`);
                }
            }

            // Send each message separately -- in future want to send them to the respective channels
            for (const message of responseMessages) {
                await interaction.followUp(message);
            }
        } catch (error) {
            console.error('Error fetching data from SheetDB:', error);
        }
    }
};
