const { Command, CommandType } = require('gcommands');

new Command({
    name: 'stop',
    description: 'Just stop',
    type: [ CommandType.SLASH ],
    run: ({ reply, client, guild, member }) => {
        if (!member.voice?.channel) return reply({ content: 'Beep boop voice?', ephemeral: true });

        const queue = client.queue.get(guild.id);
        if (!queue) return reply({ content: 'Beep boop queue?', ephemeral: true });

        queue.connection.state.subscription.player.removeAllListeners();
        queue.connection.destroy();
        client.queue.delete(guild.id);

        reply({ content: 'Stopped!' });
    }
});
