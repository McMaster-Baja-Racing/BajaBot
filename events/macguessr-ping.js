const { Events } = require('discord.js');

const MACGUESSR_ROLE_ID = '1420804718036386047';
const MACGUESSR_THREAD_ID = '1420788869930024991';
const MACGUESSR_URL = 'https://macguessr.com/';

const PING_HOUR = 13; // 1pm
const PING_MINUTE = 0;

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        const scheduleNextPing = () => {
            const now = new Date();
            const nextPing = new Date();
            nextPing.setHours(PING_HOUR, PING_MINUTE, 0, 0);
            if (now >= nextPing) {
                nextPing.setDate(nextPing.getDate() + 1);
            }
            const msUntilNextPing = nextPing.getTime() - now.getTime();
            setTimeout(async () => {
                await sendMacGuessrPing(client);
                scheduleNextPing();
            }, msUntilNextPing);
            console.log(`Next MacGuessr ping scheduled for ${nextPing.toLocaleString()}`);
        };
        scheduleNextPing();
    },
};

async function sendMacGuessrPing(client) {
    try {
        const thread = await client.channels.fetch(MACGUESSR_THREAD_ID);
        if (!thread) {
            console.error(`MacGuessr thread with ID ${MACGUESSR_THREAD_ID} not found.`);
            return;
        }
        const message = `<@&${MACGUESSR_ROLE_ID}> LOCK IN! You must play today's MacGuessr! ${MACGUESSR_URL}`;
        await thread.send(message);
        console.log('Sent daily MacGuessr ping.');
    } catch (error) {
        console.error('Error sending MacGuessr ping:', error);
    }
}
