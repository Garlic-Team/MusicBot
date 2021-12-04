const { Command, ArgumentType } = require('gcommands');

class Volume extends Command {
    constructor(client) {
        super(client, {
            name: 'volume',
            description: 'Change song volume',
            args: [
                {
                    name: 'volume',
                    type: ArgumentType.INTEGER,
                    description: 'volume',
                    required: true,
                },
            ],
            guildOnly: '747526604116459691',
        });
    }

    run({ respond, client, guild, member, args }) {
        if (!member.voice?.channel) return respond({ content: 'Beep boop voice?', ephemeral: true });

        const queue = client.queue.get(guild.id);
        if (!queue) return respond({ content: 'Beep boop queue?', ephemeral: true });

        const volume = args.getInteger('volume');
        if (volume > 100 || volume < 1) return respond({ content: 'No, `v<100 && v>1`', ephemeral: true });

        queue.connection.state.subscription.player.state.resource.volume.setVolume(volume / 100);

        respond({ content: `Done! New volume is \`${volume}%\`` });
    }
}

module.exports = Volume;
