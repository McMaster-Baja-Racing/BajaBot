const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { token, githubToken } = require('../config.json');

const POLLING_INTERVAL = 60000; 
const PR_CHANNEL = '1303489918898540634';
const ORG_NAME = 'McMaster-Baja-Racing';
const PR_ROLE = '1219273331166019654';

const REPOS = [
    'Better-Data-Viewer',
    'BajaBot',
    'DAQ_box',
];

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

let processedPRs = new Set();

async function checkNewPRs() {
    try {
        for (const repo of REPOS) {
            const response = await axios.get(`https://api.github.com/repos/${ORG_NAME}/${repo}/pulls`, {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                },
            });

            response.data.forEach(pr => {
                if (!processedPRs.has(pr.id)) {
                    const message = `<@&${PR_ROLE}> New PR by ${pr.user.login} in [**${repo}**](https://github.com/${ORG_NAME}/${repo}): [**${pr.title}**](${pr.html_url})`;
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
