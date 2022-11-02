const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newschmittyism')
		.setDescription('Adds a new Schmittyism to the loop')
        .addStringOption(option => option.setName('schmittyism').setDescription('Input the new Schmittyism!').setRequired(true)),
	async execute(interaction) {
        
        fs.readFile('assets/schmits.json', 'utf8', (err, data) => {
            if (err){
                console.log(err);
            } else {
                obj = JSON.parse(data);
                console.log(obj);
                obj.schmittys.push({message: interaction.options.getString('schmittyism'), creatorID: interaction.user.id, dateTime: new Date()});
                json = JSON.stringify(obj);

                fs.writeFile('assets/schmits.json', json, 'utf8', (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("New Schmittyism added!");
                    }
                });
            }
        })

		return interaction.reply({content: `Added "${interaction.options.getString('schmittyism')}" to the loop`, ephemeral: true});
	},
};