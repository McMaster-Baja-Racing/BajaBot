const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { token, githubToken } = require('../config.json');

const POLLING_INTERVAL = 60000;
const PR_CHANNEL = '1303489918898540634';
const ORG_NAME = 'McMaster-Baja-Racing';
const REMINDER_INTERVAL = 86400000; // 1 day 

const REPOS = [
    'Better-Data-Viewer',
    'BajaBot',
    'DAQ_box',
];

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

let processedPRs = new Map();

async function checkNewPRs() {
    try {
        for (const repo of REPOS) {
            const response = await axios.get(`https://api.github.com/repos/${ORG_NAME}/${repo}/pulls`, {
                headers: { 
                    Authorization: `Bearer ${githubToken}` 
                },
            });

            for (const pr of response.data) {
                if (pr.draft) continue; 

                const reviewResponse = await axios.get(pr.reviews_url, {
                    headers: { 
                        Authorization: `Bearer ${githubToken}` 
                    },
                });

                const isApproved = reviewResponse.data.some(review => review.state === 'APPROVED');
                if (isApproved) continue;

                const now = Date.now();
                const firstSeen = processedPRs.get(pr.id);

                if (!firstSeen) {
                    processedPRs.set(pr.id, now);
                    notify(repo, pr, true); 
                } else if (now - firstSeen >= REMINDER_INTERVAL) {
                    processedPRs.set(pr.id, now); 
                }
            }
        }
    } catch (error) {
        console.error('Error fetching PRs:', error.message);
    }
}

function notify(repo, pr, isNew) {
    const messageType = isNew ? 'New PR' : 'Reminder: PR';
    const message = `${messageType} by ${pr.user.login} in [**${repo}**](https://github.com/${ORG_NAME}/${repo}): [**${pr.title}**](${pr.html_url})${isNew ? '' : ' still needs review!'}`;
    const channel = bot.channels.cache.get(PR_CHANNEL);

    if (channel) {
        channel.send(message);
    } else {
        console.error(`Channel with ID ${PR_CHANNEL} not found.`);
    }
}

// Maybe this (and the new client thing) can be combined with index.js since it's repetitive...just not sure the best way to do that >_<
bot.once('ready', () => {
    setInterval(checkNewPRs, POLLING_INTERVAL);
});

bot.login(token);
