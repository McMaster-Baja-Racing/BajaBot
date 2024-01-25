const { EmbedBuilder } = require('discord.js');

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

module.exports = {
    formatTasks,
    calculateDates,
};