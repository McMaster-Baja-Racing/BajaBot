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

            // Define the thread IDs for each sheet
            const threadIds = {
                'Chassis': '1192481865056137247',
                'Controls': '1192508568927219773', 
                'Drivetrain': '1192666172664053891',
                'Suspension': '1192708198881308772',
                'DAQ': '1192706895614582885',
            };

            // Array to store embeds for each tab
            const responseEmbeds = [];

            const sheetColorMap = {
                'Chassis': 0x71368A, // purple
                'Controls': 0x1ABC9C, // turquoise
                'Drivetrain': 0xF1C40F, // yellow
                'Suspension': 0x2ECC71, // green
                'DAQ': 0x3498DB, // blue
            };

            for (const sheetName of Object.keys(threadIds)) {
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
                        .setColor(sheetColorMap[sheetName])
                        .setURL('https://docs.google.com/spreadsheets/d/1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI/edit#gid=0')
                        .setAuthor({ name: 'To-Do Reminder', iconURL: 'https://i.imgur.com/ALT9CPo.jpg' })

                    if (includeDetails) {
                        embed.setTitle(`${sheetName}: This Week`)
                            .addFields(
                                tasks.map(row => ({
                                    name: `__**${row.Task}**__`,
                                    value: `> **Due Date:** ${row['Due Date']}\n> **Status:** ${row.Status}\n> **Assigned To:** ${row['Assigned To']}\n> **Notes:** ${row.Notes}`,
                                }))
                            )
                            .setFooter({ text: 'Try to get these tasks done this week!' });
                    } else {
                        embed.setTitle(`${sheetName}: Next Week`)
                            .addFields(
                                tasks.map(row => ({
                                    name: '\u200B',
                                    value: `     ${row.Task}     `,
                                    inline: true
                                }))
                            )
                            .setFooter({ text: 'Prepare to get these tasks done next week!' });
                    }

                    return embed;
                };

                const thisWeekFormattedData = formatTasks(thisWeekTasks);
                const nextWeekFormattedData = formatTasks(nextWeekTasks, false);

                responseEmbeds.push({ sheetName, formattedData: thisWeekFormattedData });
                responseEmbeds.push({ sheetName, formattedData: nextWeekFormattedData });
            }

            // Send each embed to the corresponding thread
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
            console.error('Error fetching data from SheetDB:', error);
        }
    }
};
