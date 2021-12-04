const { getVoiceConnection, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('discord-ytdl-core');

class Queue {
    constructor(options) {
        this.guildId = options.guildId;
        this.channelId = options.channelId;

        this.volume = 100;
        this.connection = null;
        this.songs = options.songs ?? [];

        this.loop = false;
    }

    async play() {
        const stream = await ytdl(this.songs[0].url, this.songs[0].live ? { opusEncoded: true, isLive: true, quality: 'highestaudio', highWaterMark: 1 << 25 } : { filter: 'audioonly', opusEncoded: true, quality: 'highestaudio', highWaterMark: 1 << 25 });

        const resource = createAudioResource(stream, { inputType: StreamType.Opus, inlineVolume: true });
        const connection = getVoiceConnection(this.guildId);
        const player = connection.state.subscription.player;

        player.play(resource);
    }

    setConnection(connection) {
        this.connection = connection;
    }

    setSubscriber(subscribe) {
        this.connection.subscriber = subscribe;
    }

    setPlayer(player) {
        this.connection.player = player;
    }

    addSong(song) {
        return this.songs.push(song);
    }

    shiftSong() {
        return this.songs.shift();
    }
}

module.exports = Queue;
