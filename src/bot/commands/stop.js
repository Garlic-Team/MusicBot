const { Command } = require("gcommands");

class Stop extends Command {
    constructor(client) {
        super(client, {
            name: 'stop',
            description: 'Just stop',
            guildOnly: '747526604116459691',
        })
    }

    run({ respond, client, guild, member }) {
        if(!member.voice?.channel) return respond({ content: 'Beep boop voice?', ephemeral: true });
        
        const queue = client.queue.get(guild.id);
        if(!queue) return respond({ content: 'Beep boop queue?', ephemeral: true });

        queue.connection.state.subscription.player.removeAllListeners();
        queue.connection.destroy();
        client.queue.delete(guild.id);

        respond({ content: 'Stopped!' })
    }
}

module.exports = Stop;