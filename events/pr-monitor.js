const axios = require('axios');
const { githubToken } = require('../config.json');

const POLLING_INTERVAL = 60000; // 1 minute
const PR_CHANNEL = '1303489918898540634';
const ORG_NAME = 'McMaster-Baja-Racing';
const REMINDER_INTERVAL = 86400000; // 1 day 

const REPOS = [
    'Better-Data-Viewer',
    'BajaBot',
    'DAQ_box',
];

let processedPRs = new Map();

async function checkNewPRs(client) {
    try {
        // Check if token exists and log details
        if (!githubToken) {
            console.error('GitHub token is missing from config.json');
            return;
        }

        console.log('GitHub token loaded:', githubToken ? 'Yes' : 'No');
        console.log('Token starts with ghp_:', githubToken?.startsWith('ghp_'));
        console.log('Token length:', githubToken?.length);

        for (const repo of REPOS) {
            const prUrl = `https://api.github.com/repos/${ORG_NAME}/${repo}/pulls`;
            console.log(`Fetching PRs from: ${prUrl}`);
            
            const response = await axios.get(prUrl, {
                headers: { 
                    Authorization: `token ${githubToken}`,
                    'User-Agent': 'BajaBot'
                },
            });

            console.log(`Found ${response.data.length} PRs in ${repo}`);

            for (const pr of response.data) {
                if (pr.draft) continue; 

                const reviewUrl = `https://api.github.com/repos/${ORG_NAME}/${repo}/pulls/${pr.number}/reviews`;
                console.log(`Fetching reviews from: ${reviewUrl}`);
                
                const reviewResponse = await axios.get(reviewUrl, {
                    headers: { 
                        Authorization: `token ${githubToken}`,
                        'User-Agent': 'BajaBot'
                    },
                });

                const isApproved = reviewResponse.data.some(review => review.state === 'APPROVED');
                if (isApproved) continue;

                const now = Date.now();
                const firstSeen = processedPRs.get(pr.id);

                if (!firstSeen) {
                    processedPRs.set(pr.id, now);
                    notify(client, repo, pr, true); 
                } else if (now - firstSeen >= REMINDER_INTERVAL) {
                    notify(client, repo, pr, false);
                    processedPRs.set(pr.id, now);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching PRs:', error.message);
        console.error('Full error:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

function notify(client, repo, pr, isNew) {
    const messageType = isNew ? 'New PR' : 'Reminder: PR';
    const message = `${messageType} by ${pr.user.login} in [**${repo}**](https://github.com/${ORG_NAME}/${repo}): [**${pr.title}**](${pr.html_url})${isNew ? '' : ' still needs review!'}`;
    const channel = client.channels.cache.get(PR_CHANNEL);

    if (channel) {
        channel.send(message);
    } else {
        console.error(`Channel with ID ${PR_CHANNEL} not found.`);
    }
}

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('PR Monitor started - checking for pull requests every minute');
        
        // Start the PR monitoring interval
        setInterval(() => {
            checkNewPRs(client);
        }, POLLING_INTERVAL);
        
        // Run initial check after a short delay
        setTimeout(() => {
            checkNewPRs(client);
        }, 5000);
    },
};
