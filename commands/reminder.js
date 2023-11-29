const { SlashCommandBuilder } = require('@discordjs/builders');
const chrono = require('chrono-node');
const scheduledScrimSchema = require('../models/scheduled-scrim-schema');
const db = require('../models/db');
const config = require('../config.json');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const schedule = require('node-schedule');

const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

// Function to send a reminder message in the channel
async function sendChannelReminder(scheduledScrim) {
    const channel = await client.channels.fetch(scheduledScrim.channel);
    const role = scheduledScrim.role;
    // Send the reminder message in the channel with role ping
    await channel.send(`<@&${role}>: ${scheduledScrim.content}`);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Schedule an automatic reminder!')
    .addChannelOption(option => option.setName('channel').setDescription('The channel the reminder will be sent to').setRequired(true))
    .addStringOption(option => option.setName('date').setDescription('The date the reminder will be sent').setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('The message that will be included').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('The role to ping for the reminder').setRequired(true))
    .addStringOption(option => option.setName('recurrence').setDescription('Choose the recurrence').setRequired(true)
        .addChoices(
            {name: 'Daily',value: 'daily'},
            {name: 'Weekly', value:'weekly'},
            {name: 'Monthly', value: 'monthly'},
            {name:'Bi-weekly', value:'biweekly'},
            {name:'None', value:'none'}
        )
    ),

    async execute(interaction) {
        await db; // Wait for the database connection

        const channel = interaction.options.getChannel('channel');
        const date = chrono.parseDate(interaction.options.getString('date'));
        const message = interaction.options.getString('message');
        const role = interaction.options.getRole('role');
        const recurrence = interaction.options.getString('recurrence');

        try {
            let newScrim;

            newScrim = new scheduledScrimSchema({
                date: new Date(date),
                content: message,
                channel: channel.id,
                role: role.id,
                recurrence: recurrence,
            });

            await newScrim.save();

            // Schedule the reminder for this scrim
            const now = new Date();
            schedule.scheduleJob(new Date(date), async () => {
                sendChannelReminder(newScrim);

                if (recurrence == 'none') {
                    // Remove the non-recurring reminder from the database after sending
                    await scheduledScrimSchema.findByIdAndDelete(newScrim._id);
                } else {
                    // Update the date for recurring reminders
                    updateDateBasedOnRecurrence(newScrim, recurrence);
                    await newScrim.save();
                    // Schedule the recursive function for the next occurrence
                    scheduleRecurringJob(newScrim, recurrence);
                }
            });

            // Send a confirmation DM to the user who wrote the command
            interaction.user.send(`You have a reminder scheduled: "${message}" in ${channel} on ${date}`);
            // The little 'only you can see this' thing that the bot will send
            return interaction.reply({ content: `Scheduled "${message}" in ${channel} on ${date}`, ephemeral: true });

        } catch (error) {
            console.error('Error saving reminder:', error);
            return interaction.reply({ content: 'An error occurred while scheduling the reminder.', ephemeral: true });
        }

    },
};

// Recursive function to handle scheduling for recurring reminders
function scheduleRecurringJob(scrim, recurrence) {
    schedule.scheduleJob(scrim.date, async () => {
        sendChannelReminder(scrim);
        updateDateBasedOnRecurrence(scrim, recurrence);
        await scrim.save();
        scheduleRecurringJob(scrim, recurrence);
    });
}

function updateDateBasedOnRecurrence(scrim, recurrence) {
    // Update the date based on the recurrence type
    switch (recurrence) {
        case 'daily':
            scrim.date.setDate(scrim.date.getDate() + 1);
            break;
        case 'weekly':
            scrim.date.setDate(scrim.date.getDate() + 7);
            break;
        case 'monthly':
            scrim.date.setMonth(scrim.date.getMonth() + 1);
            break;
        case 'biweekly':
            scrim.date.setDate(scrim.date.getDate() + 14);
            break;
        default:
            break;
    }
}