# BajaBot
A discordJS bot to support the McMaster Baja Racing Organization

## Setup
1. Create a config.json file with the following format
```
{
    "clientId" : "",
    "guildId" : "",
    "token" : "",
    "wikiApiKey": "",
    "githubToken": ""
}
```
Where:
- The clientId is the ID of your bot,
- guildId is of your server, 
- the token is the bot token,
- the wikiApiKey is the api key from the admin panel of the Wiki, and
- the githubToken is a (classic) personal access token for a GitHub account with access to the Baja Racing org

2. Then, run `npm i` in order to install all node modules
3. Run deploy-commands.js to send the commands to the discord server.
4. Run `npm start` to begin hosting the bot
4. Host index.js as long as you'd like to run the discord bot

## Run with Docker
1. Build the container with `docker build -t baja-sensei .`
2. Run the container with `docker run --restart unless-stopped -d baja-sensei`

## List of wanted features so far:
### Automatic reminders for meetings 
- Recurring reminders
- Ping role with message and options
### Table generator for machining schedule
- Interact with spreadsheet and/or table formatted in discord
- Should be easy to modify things if schedule changes
### Reimbursement
- Gather the info that is collected through this form, using a slash command: https://forms.gle/Y25AVRNqcWGikPPL7
- Add info. to the form + running totals where applicable
- Automatically message the reimbursements channel the way people do manually rn
### Owing money for comps/other things
- For comps could grab a list of people from a competition channel and then put them all down automatically
- As e-transfers come through, recognize the emails and then take off people who no longer owe
- Automatic reminders via DMs for people who currently owe
