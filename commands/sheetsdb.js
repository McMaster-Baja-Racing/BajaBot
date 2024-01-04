const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sheetdb')
        .setDescription('sheet db for todo'),

    async execute(interaction) {
        try {
            await interaction.reply({ content: "Fetching data from the spreadsheet...", ephemeral: true });

            const sheetName = 'Chassis';
            const response = await axios.get(`https://sheetdb.io/api/v1/trx2ey55em789?sheet=${sheetName}`);
            
            const sheetData = response.data.slice(0, 5); // Limit to the first 5 rows

            const formattedData = sheetData.map(row => {
                return `**Subteam:** ${row.Subteam}\n**Task:** ${row.Task}\n**Due Date:** ${row['Due Date']}\n**Status:** ${row.Status}\n**Assigned To:** ${row['Assigned To']}\n**Notes:** ${row.Notes}`;
            }).join('\n\n');

            await interaction.followUp(formattedData);
        } catch (error) {
            console.error('Error fetching data from SheetDB:', error);
        }
    }
}
