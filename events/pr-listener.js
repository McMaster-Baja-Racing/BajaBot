const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { token, githubToken } = require('../config.json');

const POLLING_INTERVAL = 60000; 
const PR_CHANNEL = '1303489918898540634';

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

let processedPRs = new Set();

async function checkNewPRs() {
    try {
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `Bearer ${githubToken}`,
            },
        });

        for (const repo of response.data) {
            const owner = repo.owner.login;
            const name = repo.name;

            const prResponse = await axios.get(`https://api.github.com/repos/${owner}/${name}/pulls`, {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                },
            });

            prResponse.data.forEach(pr => {
                if (!processedPRs.has(pr.id)) {
                    const message = `POGGERS! PR by ${pr.user.login} in ${name}: **${pr.title}**\n${pr.html_url}`;
                    const channel = bot.channels.cache.get(PR_CHANNEL);
                    if (channel) {
                        channel.send(message);
                    } else {
                        console.error(`Channel with ID ${PR_CHANNEL} not found.`);
                    }
                    processedPRs.add(pr.id); 
                }
            });
        }
    } catch (error) {
        console.error('Error fetching PRs:', error.message); 
    }
}

function startPolling() {
    checkNewPRs(); 
    setInterval(checkNewPRs, POLLING_INTERVAL);
}

// Maybe this (and the new client thing) can be combined with index.js since it's repetitive...just not sure the best way to do that >_<
bot.once('ready', () => {
    startPolling();
});

bot.login(token);
