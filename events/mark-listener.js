// mark-listener.js
const { Events } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        const users = {
            '562741216840515594': [
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
              "Nyaa~ Mawk-kun! (´• ω •`)ﾉ Jus wanted to remind chu that chu are super special! UwU"
            ],

            '528410587093401603': [
              "Hewwooo Peter-kun! (｡♥‿♥｡) Jus wanted to say chu make my heart go doki doki~ OwO",
              "Haiii Peter-senpai! (⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄ Teehee, chu awe so kawaii~ UwU",
              "Hewwoooo Peter! (* >ω<) Just wanted to remind chu dat chu awe amazying~ OwO",
              "Nyaa~ Peter-kun! (*^ω^*) Wishing chu a day fuww of happiiness and wuv! UwU",
              "Hewwo Peter-senpai! (* >ω<) Jus wanted to sprinkle some uwu magic on your day~ OwO",
              "Haiii Peter~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) Sending chu virtual head pats and snuggles! UwU",
              "Hewwooo Peter-kun! (｡♥‿♥｡) Jus wanted to say chu light up my worwd like stawshine! OwO",
              "Hai Peter~ (人◕ω◕) Sending chu lots of positive energy and warm squishes! UwU",
              "Nyaa~ Peter-senpai! (⁄≧◡≦)/ Jus wanted to brighten your day with a sprinkle of happiness! UwU",
              "Hewwo Peter! (*^‿^*) Sending chu a virtual cupcake filled with love and uwu! OwO",
              "Haiii Peter~ (ﾉ^ヮ^)ﾉ*:・ﾟ✧ Jus wanted to say chu're amazing and chu got this! UwU",
              "Nyaa~ Peter-kun! (´• ω •`)ﾉ Jus wanted to remind chu that chu are super special! UwU",
              "Hewwoooo Peter! (✿◠‿◠) Sending chu positive vibes and cuddly thoughts! OwO",
              "Hai Peter-senpai! (｡♥‿♥｡) Jus wanted to say chu make my heart do backflips of joy! OwO",
              "Hewwo Peter! (｡♥‿♥｡) Jus wanted to say chu make my heart do backflips of joy! OwO",
              "Haiii Peter~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) Sending chu virtual head pats and snuggles! UwU",
              "Hewwooo Peter-kun! (｡♥‿♥｡) Jus wanted to say chu light up my worwd like stawshine! OwO",
              "Hai Peter~ (人◕ω◕) Sending chu lots of positive energy and warm squishes! UwU",
              "Nyaa~ Peter-senpai! (⁄≧◡≦)/ Jus wanted to brighten your day with a sprinkle of happiness! UwU",
              "Hewwo Peter! (*^‿^*) Sending chu a virtual cupcake filled with love and uwu! OwO",
            ],

            '544341005420199937': [
              "Hewwooo Salma-chan! (｡♥‿♥｡) Jus wanted to say chu make my heart go doki doki~ OwO",
              "Haiii Salma-senpai! (⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄ Teehee, chu awe so kawaii~ UwU",
              "Hewwoooo Salma! (* >ω<) Just wanted to remind chu dat chu awe amazying~ OwO",
              "Nyaa~ Salma-chan! (*^ω^*) Wishing chu a day fuww of happiiness and wuv! UwU",
              "Hewwo Salma-senpai! (* >ω<) Jus wanted to sprinkle some uwu magic on your day~ OwO",
              "Haiii Salma~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) Sending chu virtual head pats and snuggles! UwU",
              "Hewwooo Salma-chan! (｡♥‿♥｡) Jus wanted to say chu light up my worwd like stawshine! OwO",
              "Hai Salma~ (人◕ω◕) Sending chu lots of positive energy and warm squishes! UwU",
              "Nyaa~ Salma-senpai! (⁄≧◡≦)/ Jus wanted to brighten your day with a sprinkle of happiness! UwU",
              "Hewwo Salma! (*^‿^*) Sending chu a virtual cupcake filled with love and uwu! OwO",
              "Haiii Salma~ (ﾉ^ヮ^)ﾉ*:・ﾟ✧ Jus wanted to say chu're amazing and chu got this! UwU",
              "Nyaa~ Salma-chan! (´• ω •`)ﾉ Jus wanted to remind chu that chu are super special! UwU",
              "Hewwoooo Salma! (✿◠‿◠) Sending chu positive vibes and cuddly thoughts! OwO",
              "Hai Salma-senpai! (｡♥‿♥｡) Jus wanted to say chu make my heart do backflips of joy! OwO",
              "Hewwo Salma! (｡♥‿♥｡) Jus wanted to say chu make my heart do backflips of joy! OwO",
              "Haiii Salma~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) Sending chu virtual head pats and snuggles! UwU",
              "Hewwooo Salma-chan! (｡♥‿♥｡) Jus wanted to say chu light up my worwd like stawshine! OwO",
              "Hai Salma~ (人◕ω◕) Sending chu lots of positive energy and warm squishes! UwU",
              "Nyaa~ Salma-senpai! (⁄≧◡≦)/ Jus wanted to brighten your day with a sprinkle of happiness! UwU",
              "Hewwo Salma! (*^‿^*) Sending chu a virtual cupcake filled with love and uwu! OwO",
            ],

            '654827963677671428': [
              "Hewwooo Maryam-chan! (｡♥‿♥｡) Jus wanted to say chu make my heart go doki doki~ OwO",
              "Haiii Maryam-senpai! (⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄ Teehee, chu awe so kawaii~ UwU",
              "Hewwoooo Maryam! (* >ω<) Just wanted to remind chu dat chu awe amazying~ OwO",
              "Nyaa~ Maryam-chan! (*^ω^*) Wishing chu a day fuww of happiiness and wuv! UwU",
              "Hewwo Maryam-senpai! (* >ω<) Jus wanted to sprinkle some uwu magic on your day~ OwO",
              "Haiii Maryam~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) Sending chu virtual head pats and snuggles! UwU",
              "Hewwooo Maryam-chan! (｡♥‿♥｡) Jus wanted to say chu light up my worwd like stawshine! OwO",
              "Hai Maryam~ (人◕ω◕) Sending chu lots of positive energy and warm squishes! UwU",
              "Nyaa~ Maryam-senpai! (⁄≧◡≦)/ Jus wanted to brighten your day with a sprinkle of happiness! UwU",
              "Hewwo Maryam! (*^‿^*) Sending chu a virtual cupcake filled with love and uwu! OwO",
              "Haiii Maryam~ (ﾉ^ヮ^)ﾉ*:・ﾟ✧ Jus wanted to say chu're amazing and chu got this! UwU",
              "Nyaa~ Maryam-chan! (´• ω •`)ﾉ Jus wanted to remind chu that chu are super special! UwU",
              "Hewwoooo Maryam! (✿◠‿◠) Sending chu positive vibes and cuddly thoughts! OwO",
              "Hai Maryam-senpai! (｡♥‿♥｡) Jus wanted to say chu make my heart do backflips of joy! OwO",
              "Hewwo Maryam! (｡♥‿♥｡) Jus wanted to say chu make my heart do backflips of joy! OwO",
              "Haiii Maryam~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) Sending chu virtual head pats and snuggles! UwU",
              "Hewwooo Maryam-chan! (｡♥‿♥｡) Jus wanted to say chu light up my worwd like stawshine! OwO",
              "Hai Maryam~ (人◕ω◕) Sending chu lots of positive energy and warm squishes! UwU",
              "Nyaa~ Maryam-senpai! (⁄≧◡≦)/ Jus wanted to brighten your day with a sprinkle of happiness! UwU",
              "Hewwo Maryam! (*^‿^*) Sending chu a virtual cupcake filled with love and uwu! OwO",
            ]
        };

        const channelId = '1022004325326782494';

        // if the author's id matches one of the specific user ids
        if (message.channel.id === channelId && users[message.author.id]) {
            // send random message from the array corresponding to the user
            const userMessages = users[message.author.id];
            const randomMessage = userMessages[Math.floor(Math.random() * userMessages.length)];
            message.reply(randomMessage);
        }
    },
};