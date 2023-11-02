const { SlashCommandBuilder } = require('@discordjs/builders');
const chrono = require('chrono-node');
const scheduledScrimSchema = require('../models/scheduled-scrim-schema');
const db = require('../models/db');
const config = require('../config.json');
const { Client, Intents } = require('discord.js');
const schedule = require('node-schedule');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Function to send a reminder message in the channel
async function sendChannelReminder(scheduledScrim) {
    const channel = await client.channels.fetch(scheduledScrim.channel);
    //console.log('Fetched channel:', channel.id); // Log the channel ID for debugging
    const role = scheduledScrim.role;
    // Send the reminder message in the channel with user ping
    await channel.send(`<@&${role}>: ${scheduledScrim.content}`);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scrim-scheduler')
        .setDescription('Schedule a scrim with an automatic reminder!')
        .addChannelOption(option => option.setName('channel').setDescription('The channel the reminder will be sent to').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('The date the reminder will be sent').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The message that will be included').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('The role to ping for the reminder').setRequired(true)
    ),

    async execute(interaction) {
        await db; // Wait for the database connection

        const channel = interaction.options.getChannel('channel');
        const date = chrono.parseDate(interaction.options.getString('date'));
        const message = interaction.options.getString('message');
        const role = interaction.options.getRole('role');

        try {
            const newScrim = new scheduledScrimSchema({
                date: new Date(date),
                content: message,
                channel: channel.id,
                role: role.id,
            });

            await newScrim.save();
            //console.log('Scrim saved successfully:', newScrim);

            // Schedule the reminder for this scrim
            const now = new Date();
            if (new Date(date) > now) {
                schedule.scheduleJob(new Date(date), () => {
                    sendChannelReminder(newScrim);
                });
            }

            // Send a confirmation DM to the user who wrote the command
            interaction.user.send(`You have a scrim scheduled: "${message}" in ${channel} on ${date}`);
            // The little only you can see this thing that the bot will send
            return interaction.reply({ content: `Scheduled "${message}" in ${channel} on ${date}`, ephemeral: true });

        } catch (error) {
            console.error('Error saving scrim:', error);
            return interaction.reply({ content: 'An error occurred while scheduling the scrim.', ephemeral: true });
        }

    },
};