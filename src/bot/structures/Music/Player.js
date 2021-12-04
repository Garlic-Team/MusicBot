const { AudioPlayerStatus, joinVoiceChannel, createAudioResource, createAudioPlayer, StreamType, NoSubscriberBehavior, getVoiceConnection, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const Queue = require("./Queue");

class Player {
    static async play(client, guildId, channelId, song) {
        let queue = client.queue.get(guildId);
        
        if(queue) queue.addSong(song);
        else {
            queue = this.createQueue(guildId, channelId, song);
            client.queue.set(guildId, queue);

            await this.setup(client, guildId, channelId, queue);
            await queue.play();
        }
    }

    static createQueue(guildId, channelId, song) {
        const queue = new Queue({
            guildId: guildId,
            channelId: channelId,
            songs: [song]
        })

        return queue;
    }

    static async setup(client, guildId, channelId, queue) {
        const channel = client.channels.cache.get(channelId);

        const connection = await joinVoiceChannel({
            guildId: guildId,
            channelId: channelId,
            adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        })

        const player = await createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Play }
        })

        const subscribe = connection.subscribe(player);

        queue.setConnection(connection);
        queue.setSubscriber(subscribe);
        queue.setPlayer(player);

        connection.state.subscription.player.once(AudioPlayerStatus.Playing, () => channel.type === "GUILD_STAGE_VOICE" && channel.guild.me.voice.setSuppressed(false));
        connection.state.subscription.player.on("error", () => {});

        connection.state.subscription.player.on('stateChange', async(oldState, newState) => {
            const queue = client.queue.get(guildId);
            if(!queue) return;

            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                if(queue?.loop) {
                    let last = queue.shiftSong();
                    queue.addSong(last);
    
                    queue.play();
                } else {
                    queue.shiftSong();

                    if(!queue.songs[0]) {
                        queue.connection.state.subscription.player.removeAllListeners();

                        client.queue.delete(guildId);
                        queue.connection.destroy();
                    } else {
                        queue.play();
                    }
                }
            }

            if (newState.status === AudioPlayerStatus.Playing && oldState.status === AudioPlayerStatus.Buffering) {
                queue.connection.state.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
            }
        })
    }
}

module.exports = Player;