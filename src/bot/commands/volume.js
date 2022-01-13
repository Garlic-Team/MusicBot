const { Command, ArgumentType, CommandType } = require('gcommands');

new Command({
    name: 'volume',
    description: 'Change song volume',
    type: [ CommandType.SLASH ],
    arguments: [
        {
            name: 'volume',
            type: ArgumentType.INTEGER,
            description: 'volume',
            required: true,
        },
    ],
    run: ({ reply, client, guild, member, arguments: args }) => {
        if (!member.voice?.channel) return reply({ content: 'Beep boop voice?', ephemeral: true });

        const queue = client.queue.get(guild.id);
        if (!queue) return reply({ content: 'Beep boop queue?', ephemeral: true });

        const volume = args.getInteger('volume');
        if (volume > 100 || volume < 1) return reply({ content: 'No, `v<100 && v>1`', ephemeral: true });

        queue.connection.state.subscription.player.state.resource.volume.setVolume(volume / 100);

        reply({ content: `Done! New volume is \`${volume}%\`` });
    }
});
