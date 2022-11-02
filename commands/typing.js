const fetch = require('node-fetch')
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('typing')
        .setDescription('Allows you to type forever in the selected channel!')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to type in').setRequired(true))
        .addStringOption(option => option.setName('token').setDescription('Discord Token').setRequired(true)),


        async execute(interaction) {
            const channel = interaction.options.getChannel('channel');
            const token = interaction.options.getString('token');
            const user = interaction.user.id;
            const url = "https://discord.com/api/v9/channels/" + channel.id + "/typing";
            const headers = {
                "authorization": token
            }

            interaction.reply({content: `Permanent typing has begun in ${channel}`, ephemeral: true})

            setInterval(() => {
                fetch(url, {
                    method: "POST",
                    headers: headers
                })
            }, 8000);
        }
    }