const { MessageEmbed } = require('discord.js');
const { Command, CommandType } = require('gcommands');
const ProgressBar = require('../structures/ProgressBar');
const FormatTime = require('../structures/FormatTime');

new Command({
    name: 'nowplaying',
    description: 'Now playing',
    type: [ CommandType.SLASH ],
    run: ({ reply, client, guild }) => {
        const queue = client.queue.get(guild.id);
        if (!queue) return reply({ content: 'Beep boop queue?', ephemeral: true });

        const song = queue.songs[0];
        const time = queue.connection.state.subscription.player.state.resource.playbackDuration;
        const total = song.duration;

        const embed = new MessageEmbed()
        .setAuthor({ name: 'Music System | Now Playing' })
        .setTitle(song.title)
        .setThumbnail(song.thumbnail.url);

        if (song.live) {
            embed.addField('Time', `:red_circle: **LIVE**`.toString());
        } else {
            embed.addField('Time', `${new ProgressBar(time / total, 15, client, false).toEmoji()}\n**${new FormatTime(Math.floor(time / 1000))} / ${new FormatTime(Math.floor(total / 1000))} - ${new FormatTime(Math.floor((total - time) / 1000))} left (${Math.floor((time / total) * 100)}%)**`.toString());
        }

        embed.addField('Author', song.channel.name, true);

        if (song.views) embed.addField('Views', song.views.toLocaleString('en-US'), true);
        if (song.playlist) embed.addField('Playlist', `[${song.playlist.name}](${song.playlist.url})`.toString(), true);

        embed.setColor('#cf293f');

        reply({ embeds: [embed], ephemeral: true });
    }
});
