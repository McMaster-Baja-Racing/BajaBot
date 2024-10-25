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
        if (message.channel.id === PDF_CHANNEL && message.attachments.size > 0) {
            await Promise.all(message.attachments.map(async (attachment) => {
                if (attachment.contentType !== 'application/pdf') return;
                console.log('PDF detected:', attachment.url);

                try {
                    const { data } = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    
                    const formData = new FormData();
                    formData.append('mediaUpload', JSON.stringify({ folderId: WIKI_FOLDER }), { contentType: 'application/json' });
                    formData.append('mediaUpload', Buffer.from(data), { filename: attachment.name, contentType: 'application/pdf' });

                    const uploadResponse = await axios.post(`${wikiUrl}/u`, formData, {
                        headers: { ...formData.getHeaders(), 'Authorization': `Bearer ${wikiApiKey}` },
                    });

                    if (uploadResponse.status === 200) {
                        console.log('PDF uploaded to Wiki.js');
                        const attachmentName = attachment.name.toLowerCase();
                        const mkdwnLink = `[${attachmentName}](/meeting-minutes/${attachmentName})`;

                        const pageMutation = newPage(attachment.name, mkdwnLink);
                        const pageResponse = await axios.post(`${wikiUrl}/graphql`, pageMutation, {
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${wikiApiKey}` },
                        });

                        const discordLink = `[here](${wikiUrl}/meeting-minutes/${attachment.name.replace('.pdf', '')})`;

                        if (pageResponse.status === 200) {
                            console.log('Page created successfully.');
                            await message.reply({ content: `Page with attachment located ${discordLink}.`, ephemeral: true });
                        } else {
                            console.log('Failed to create page:', pageResponse.data);
                            await message.reply({ content: `Failed to create page for ${attachment.name} with error message '${pageResponse.data}`, ephemeral: true });
                        }
                    }
                } catch (error) {
                    console.error('Error processing PDF:', error.message);
                    await message.reply({ content: `Error processing the PDF: ${attachment.name} with error message '${error.message}'`, ephemeral: true });
                }
            }));
        }
    },
};