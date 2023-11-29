// mark-listener.js
const { Events } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        console.log('Message received by mark-listener:', message.content);
        const users = ['562741216840515594', '528410587093401603', '544341005420199937']; // list of ids to detect
        const channelId = '1022004325326782494';
        const messages = [
          "Hewwo Mawk! OwO How awe you todaaay? (*＾▽＾)ﾉ",
          "Haiii Mawkie~ (*≧ω≦) Teehee, just wanted to send chu wots of wuv and hugs! UwU",
          "Hewwooo Mawk-senpai! (* >ω<) Just wanted to remind chu dat chu awe amazying~ OwO",
          "Nyaa~ Mawk-kun! (*^ω^*) Wishing chu a day fuww of happiiness and wuv! UwU",
          "Hewwoooo Mawk! (｡♥‿♥｡) Jus wanted to say chu make my heart go doki doki~ OwO",
          "Hewwo Mawk-senpai! (⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄ Teehee, chu awe so kawaii~ UwU",
          "Hai Mawkie-chan! (*´∇｀*) Just wanted to send chu smowches and sunshine! OwO",
          "Nyaa~ Mawk-senpai! (＾◡＾)っ✂️ Jus wanted to cutify your day with kawaiiness! UwU",
          "Hewwoooo Mawk! (✿◠‿◠) Sending chu positive vibes and cuddly thoughts! OwO",
          "Haiii Mawk-kun! (*≧ω≦) Jus wanted to say chu're speciaw and chu deserve the best! UwU",
          "Hewwo Mawk-senpai! (* >ω<) Jus wanted to sprinkle some uwu magic on your day~ OwO",
          "Nyaa~ Mawkie-chan! (*^ω^*) Wishing chu a day as sweet as pocky and as warm as tea! UwU",
          "Hewwo Mawk! (｡♥‿♥｡) Jus wanted to say chu make my heart do backflips of joy! OwO",
          "Haiii Mawkie~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) Sending chu virtual head pats and snuggles! UwU",
          "Hewwooo Mawk-senpai! (｡♥‿♥｡) Jus wanted to say chu light up my worwd like stawshine! OwO",
          "Hai Mawkie~ (人◕ω◕) Sending chu lots of positive energy and warm squishes! UwU",
          "Nyaa~ Mawk-senpai! (⁄≧◡≦)/ Jus wanted to brighten your day with a sprinkle of happiness! UwU",
          "Hewwo Mawk! (*^‿^*) Sending chu a virtual cupcake filled with love and uwu! OwO",
          "Haiii Mawkie-chan! (ﾉ^ヮ^)ﾉ*:・ﾟ✧ Jus wanted to say chu're amazing and chu got this! UwU",
          "Nyaa~ Mawk-kun! (´• ω •`)ﾉ Jus wanted to remind chu that chu are super special! UwU",
      ];

        // if the author's id matches one of the specific user ids
        if (message.channel.id === channelId && users.includes(message.author.id)) {
            // send random message from the array
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            message.reply(randomMessage);
        }
    },
};
