const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sheetdb')
        .setDescription('sheet db for todo'),

    async execute(interaction) {
        try {
            await interaction.reply({ content: "Fetching data from the spreadsheet...", ephemeral: true });

            const sheetNames = ['Chassis', 'Controls', 'Drivetrain', 'Suspension', 'DAQ'];

            // Array to store embeds for each tab
            const responseEmbeds = [];

            const sheetColorMap = {
                'Chassis': 0x71368A, // purple
                'Controls': 0x1ABC9C, // turquoise
                'Drivetrain': 0xF1C40F, // yellow
                'Suspension': 0x2ECC71, // green
                'DAQ': 0x3498DB, // blue
            };

            for (const sheetName of sheetNames) {
                const response = await axios.get(`https://sheetdb.io/api/v1/trx2ey55em789?sheet=${sheetName}`);

                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const thisWeekStartDate = new Date(currentDate);
                const thisWeekEndDate = new Date(currentDate);
                thisWeekEndDate.setDate(currentDate.getDate() + (7 - currentDate.getDay()));
                const nextWeekStartDate = new Date(thisWeekEndDate);
                nextWeekStartDate.setDate(thisWeekEndDate.getDate() + 1);

                const sheetData = response.data.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return (dueDate >= thisWeekStartDate && dueDate <= thisWeekEndDate) || (dueDate >= nextWeekStartDate && dueDate < new Date(nextWeekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000));
                });

                const thisWeekTasks = sheetData.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return dueDate >= thisWeekStartDate && dueDate <= thisWeekEndDate;
                });

                const nextWeekTasks = sheetData.filter(row => {
                    const dueDate = new Date(row['Due Date']);
                    return dueDate >= nextWeekStartDate && dueDate < new Date(nextWeekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                });

                const formatTasks = (tasks, includeDetails = true) => {
                    const embed = new EmbedBuilder()
                        .setColor(sheetColorMap[sheetName] || 0xFF0000);
                
                        if (includeDetails) {
                            embed.setTitle(`To-Do for ${sheetName} This Week`)
                                .addFields(
                                    tasks.map(row => ({
                                        name: `${row.Task}`,
                                        value: `**Due Date:** ${row['Due Date']}\n**Status:** ${row.Status}\n**Assigned To:** ${row['Assigned To']}\n**Notes:** ${row.Notes}`
                                    }))
                                );
                        } else {
                            embed.setTitle(`${sheetName} tasks to prepare for next week`)
                                .addFields(
                                    tasks.map(row => ({
                                        name: `${row.Task}`,
                                        value: '\u200B'
                                    }))
                                );
                        }
                
                    return embed;
                };

                const thisWeekFormattedData = formatTasks(thisWeekTasks);
                const nextWeekFormattedData = formatTasks(nextWeekTasks, false);

                responseEmbeds.push(thisWeekFormattedData);
                responseEmbeds.push(nextWeekFormattedData);
            }

            // Send each embed separately 
            for (const embed of responseEmbeds) {
                await interaction.followUp({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error fetching data from SheetDB:', error);
        }
    }
};
