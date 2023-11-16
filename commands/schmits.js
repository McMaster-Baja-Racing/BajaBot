const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('schmittyisms')
		.setDescription('Serves up a fresh Schmittyism'),
	async execute(interaction) {

		//read file schmits and make a list
		fs.readFile('assets/schmits.json', 'utf8', (err, data) => {
			if (err){
				console.log(err);
			} else {
				obj = JSON.parse(data);
				let schmittyList = obj.schmittys.map(schmitty => schmitty.message);
				let randomSchmitty = schmittyList[Math.floor(Math.random() * schmittyList.length)];
				return interaction.reply(randomSchmitty);
			}
		});
	},
};