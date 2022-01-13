require('dotenv').config();
const { Intents, Collection } = require('discord.js');
const { GClient } = require('gcommands');
const path = require('path');

const client = new GClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    dirs: [
        path.join(__dirname, 'commands'),
        path.join(__dirname, 'events')
    ],
    devGuildId: '747526604116459691'
});

client.queue = new Collection();

client.login(process.env.DISCORD_TOKEN);
