const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deleteschmittyism')
		.setDescription('Deletes a Schmittyism from the loop')
        .addStringOption(option => option.setName('schmittyism').setDescription('Input the old Schmittyism! (formatting matters)').setRequired(true)),
	async execute(interaction) {
        
        fs.readFile('assets/schmits.json', 'utf8', (err, data) => {
            if (err){
                console.log(err);
            } else {
                obj = JSON.parse(data);
                //find the schmittyism
                let schmittyIndex = obj.schmittys.findIndex(schmitty => schmitty.message === interaction.options.getString('schmittyism'));
                if (schmittyIndex === -1) {
                    interaction.reply({content: `Could not find "${interaction.options.getString('schmittyism')}" in the loop`, ephemeral: true})
                    return
                }
                
                //check if the user is the creator and not an admin
                if (obj.schmittys[schmittyIndex].creatorID !== interaction.user.id && !interaction.member.roles.cache.some(role => role.name === "Captain") && !interaction.member.roles.cache.some(role => role.name === "discord manager")) {
                    interaction.reply({content: `You are not the creator of "${interaction.options.getString('schmittyism')}"`, ephemeral: true})
                    return
                }
                //delete the schmittyism
                obj.schmittys.splice(schmittyIndex, 1);
                json = JSON.stringify(obj);

                fs.writeFile('assets/schmits.json', json, 'utf8', (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Schmittyism deleted!");
                    }
                });

                interaction.reply({content: `Deleted "${interaction.options.getString('schmittyism')}" from the loop`, ephemeral: true});
            }
        })
	},
};