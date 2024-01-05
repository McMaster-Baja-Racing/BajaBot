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
                'Chassis': 0x800080, // purple
                'Controls': 0x008080, // teal
                'Drivetrain': 0xFFFF00, // yellow
                'Suspension': 0x00FF00, // green
                'DAQ': 0x0000FF, // blue
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
                    const embed = new EmbedBuilder();

                    if (includeDetails) {
                        tasks.forEach(row => {
                            embed.addFields(
                                { name: `${row.Task}`, value: `**Due Date:** ${row['Due Date']}\n**Status:** ${row.Status}\n**Assigned To:** ${row['Assigned To']}\n**Notes:** ${row.Notes}` }
                            );
                        });
                    } else {
                        tasks.forEach(row => {
                            embed.addFields({ name: `${row.Task}`, value: '\u200B' });
                        });
                    }

                    return embed;
                };

                const thisWeekFormattedData = formatTasks(thisWeekTasks);
                const nextWeekFormattedData = formatTasks(nextWeekTasks);

                // Skip checking if there are fields in the formatted data
                thisWeekFormattedData.setColor(sheetColorMap[sheetName] || 0xFF0000)
                    .setTitle(`To-Do for ${sheetName} This Week`)
                    .setFooter({ text: 'foot' });
                responseEmbeds.push(thisWeekFormattedData);

                // Skip checking if there are fields in the formatted data
                nextWeekFormattedData.setColor(sheetColorMap[sheetName] || 0xFF0000)
                    .setTitle(`${sheetName} tasks to prepare for next week`)
                    .setFooter({ text: 'foot' });
                responseEmbeds.push(nextWeekFormattedData);
            }

            // Send each embed separately -- in the future, you may want to send them to the respective channels
            for (const embed of responseEmbeds) {
                await interaction.followUp({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error fetching data from SheetDB:', error);
        }
    }
};