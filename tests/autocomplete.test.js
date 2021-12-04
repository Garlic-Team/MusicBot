require('dotenv').config();
const { Client } = require('discord.js');
const { search } = require("youtube-sr").default;

const client = new Client({
    intents: ['GUILDS']
})

client.on('ready', async() => {
    console.log('ready');
});

client.on('interactionCreate', async(interaction) => {
    if(interaction.isAutocomplete()) {
        let query = interaction.options.getString('member', true);
        if(query.length == 0) query = 'Never gonna give you up';

        const videos = await search(query, { limit: 25 });

        interaction.respond(videos.map(video => {
            return {
                name: video.title,
                value: video.url
            }
        }))
    }
})

client.login(process.env.DISCORD_TOKEN)