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

// Function to schedule reminders from the database at startup
async function startupReminders() {
    try {
        await db; // Wait for the database connection

        // Find all scheduled reminders with a date in the future
        const futureReminders = await scheduledScrimSchema.find({ date: { $gt: new Date() } });

        console.log('Future Reminders:', futureReminders);

        // Schedule each future reminder
        futureReminders.forEach((reminder) => {
            scheduleReminder(reminder, reminder.recurrence);
        });
        console.log('Scheduled reminders at startup.');
    } catch (error) { console.error('Error scheduling reminders at startup:', error); }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    startupReminders();
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
    .addStringOption(option => option.setName('recurrence').setDescription('Choose how often to send the reminder (choose none to only send it once)').setRequired(true)
        .addChoices(
            {name: 'Daily',value: 'daily'},
            {name: 'Weekly', value:'weekly'},
            {name: 'Monthly', value: 'monthly'},
            {name:'Bi-weekly (once every two weeks)', value:'biweekly'},
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
            let newReminder;

            newReminder = new scheduledScrimSchema({
                date: new Date(date),
                content: message,
                channel: channel.id,
                role: role.id,
                recurrence: recurrence,
            });

            await newReminder.save();

            // Schedule the reminder for this scrim
            await scheduleReminder(newReminder, recurrence);

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
function scheduleRecurringJob(reminder, recurrence) {
    schedule.scheduleJob(reminder.date, async () => {
        sendChannelReminder(reminder);
        updateDate(reminder, recurrence);
        await reminder.save();
        scheduleRecurringJob(reminder, recurrence);
    });
}

function updateDate(reminder, recurrence) {
    // Update the date based on the recurrence type
    switch (recurrence) {
        case 'daily':
            reminder.date.setDate(reminder.date.getDate() + 1);
            break;
        case 'weekly':
            reminder.date.setDate(reminder.date.getDate() + 7);
            break;
        case 'monthly':
            reminder.date.setMonth(reminder.date.getMonth() + 1);
            break;
        case 'biweekly':
            reminder.date.setDate(reminder.date.getDate() + 14);
            break;
        default:
            break;
    }
}

// Method to handle scheduling logic for reminders
async function scheduleReminder(reminder, recurrence) {
    sendChannelReminder(reminder);
    if (recurrence === 'none') {
        // Remove the non-recurring reminder from the database after sending
        await scheduledScrimSchema.findByIdAndDelete(reminder._id);
    } else {
        // Update the date for recurring reminders
        updateDate(reminder, recurrence);
        await reminder.save();
        // Schedule the recursive function for the next occurrence
        scheduleRecurringJob(reminder, recurrence);
    }
}