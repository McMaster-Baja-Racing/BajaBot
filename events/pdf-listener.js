const { Events } = require('discord.js');
const FormData = require('form-data');
const { wikiApiKey } = require('../config.json');
const axios = require('axios');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.channel.id === '1298058637121556612' && message.attachments.size > 0) { // Channel to listen in
            await Promise.all(message.attachments.map(async (attachment) => {
                if (attachment.contentType !== 'application/pdf') return;
                console.log('PDF detected:', attachment.url);

                try {
                    const { data } = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    const formData = new FormData();

                    formData.append('mediaUpload', JSON.stringify({ folderId: 17 }), { contentType: 'application/json' }); // 17 is meeting-minutes folder
                    formData.append('mediaUpload', Buffer.from(data), { filename: attachment.name, contentType: 'application/pdf' });

                    if ((await axios.post('http://wiki.mcmasterbaja.ca/u', formData, {
                        headers: { ...formData.getHeaders(), 'Authorization': `Bearer ${wikiApiKey}` },
                    })).status === 200) {
                        console.log('PDF uploaded to Wiki.js');
                        const mkdwnLink = `[${attachment.name}](/meeting-minutes/${attachment.name})`;
                        const pageMutation = JSON.stringify({
                            query: `
                            mutation {
                              pages {
                                create(
                                  title: "${attachment.name}",
                                  content: "${mkdwnLink}",
                                  description: "Meeting Minutes: ${attachment.name}",
                                  editor: "markdown",
                                  isPublished: true,
                                  isPrivate: false,
                                  locale: "en",
                                  path: "/meeting-minutes/${attachment.name.replace('.pdf', '')}",
                                  tags: []
                                ) {
                                  responseResult { message }
                                }
                              }
                            }`
                        }); // New page to be added with graphQL

                        const pageResponse = await axios.post('http://wiki.mcmasterbaja.ca/graphql', pageMutation, {
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${wikiApiKey}` },
                        });
                        console.log(pageResponse.status === 200 ? 'Page created successfully.' : 'Failed to create page:', pageResponse.data);
                    }
                } catch (error) {
                    console.error('Error processing PDF:', error.message);
                }
            }));
        }
    },
};