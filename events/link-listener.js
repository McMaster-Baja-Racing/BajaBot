const { Events } = require('discord.js');
const FormData = require('form-data');
const { wikiApiKey } = require('../config.json');
const axios = require('axios');

const PDF_CHANNEL = '1298058637121556612'; // Channel to listen in 
const WIKI_FOLDER = 17; // 17 is meeting-minutes folder 

// GraphQL mutation for creating a new page 
const newPage = (attachmentName, mkdwnLink) => JSON.stringify({
    query: `
    mutation {
      pages {
        create(
          title: "${attachmentName}",
          content: "${mkdwnLink}",
          description: "Meeting Minutes: ${attachmentName}",
          editor: "markdown",
          isPublished: true,
          isPrivate: false,
          locale: "en",
          path: "/meeting-minutes/${attachmentName.replace('.pdf', '')}",
          tags: []
        ) {
          responseResult { message }
        }
      }
    }`
});

const wikiUrl = 'http://wiki.mcmasterbaja.ca';

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.channel.id === PDF_CHANNEL) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const links = message.content.match(urlRegex);

            if (links) {
                await Promise.all(links.map(async (link) => {
                    try {
                        const title = `Link - ${new Date().toISOString()}`;
                        const mkdwnLink = `[${link}](${link})`;
                        const pageMutation = newPage(title, mkdwnLink);

                        const pageResponse = await axios.post(`${wikiUrl}/graphql`, pageMutation, {
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${wikiApiKey}` },
                        });

                        const discordLink = `[here](${wikiUrl}/meeting-minutes/${title.replace(/[^a-zA-Z0-9]/g, '-')})`;

                        if (pageResponse.status === 200) {
                            console.log('Page created successfully for link.');
                            await message.reply({ content: `Page for link created ${discordLink}.`, ephemeral: true });
                        } else {
                            console.log('Failed to create page:', pageResponse.data);
                            await message.reply({ content: `Failed to create page for link '${link}' with error message '${pageResponse.data}'`, ephemeral: true });
                        }
                    } catch (error) {
                        console.error('Error processing link:', error.message);
                        await message.reply({ content: `Error processing the link '${link}' with error message '${error.message}'`, ephemeral: true });
                    }
                }));
            }
        }
    },
};
