const { EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');
const { subteamData } = require('../models/data');

module.exports = {
  name: 'messageCreate',
  execute: async (message, client) => {
    console.log('Received message event:', message.content);

    // Google authentication stuff
    const auth = await google.auth.getClient({
      keyFile: './credentials/baja-to-do-bot-fef8bb884c17.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1pb2W0BvAOMFeM4AXIbLzxM0dWJGYtqago8_8J4S5wEI';

    const commands = ['/assign', '/complete'];

    for (const command of commands) {
      if (message.content.startsWith(command)) {
        
        break; 
      }
    }

  }
};

