const { getVoiceConnection, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

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
        const stream = await play.stream(this.songs[0].url);

        const resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true });
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
