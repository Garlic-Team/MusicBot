const { Command } = require("gcommands");

class Skip extends Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            description: 'Skip song',
            guildOnly: '747526604116459691',
        })
    }

    run({ respond, client, guild, member }) {
        if(!member.voice?.channel) return respond({ content: 'Beep boop voice?', ephemeral: true });
        
        const queue = client.queue.get(guild.id);
        if(!queue) return respond({ content: 'Beep boop queue?', ephemeral: true });

        queue.connection.state.subscription.player.stop();

        respond({ content: 'Skipped!' })
    }
}

module.exports = Skip;