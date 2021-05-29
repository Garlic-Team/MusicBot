const { MessageButton } = require("gcommands");
const ytdl = require("ytdl-core");

module.exports = async (client, guild, member, textChannel, video, isSkipped) => {
  let connection;
  try {
    connection = await member.voice.channel.join();
  } catch {
    return "Couldn't connect to the voice channel"
  }

  guild.me.voice.setSelfDeaf(true);
  connection.on("disconnect", () => {
    client.music.queue[guild.id] = [];
    client.music.data[guild.id].isPlaying = false;
    client.music.playing[guild.id] = {};
  });

  let data = {
    connection,
    channel: member.voice.channel,
    textChannel: textChannel,
    video,
    index: video.index,
    request: video.request,
    playedAt: Date.now()
  }
  video.playedAt = data.playedAt
  client.music.playing[guild.id] = data;
  client.music.data[guild.id].isPlaying = true;

  let dispatcher = connection
    .play(ytdl(`https://www.youtube.com/watch?v=${video.id}`))
    .on("finish", () => {
      let willSkip = client.music.data[guild.id].skipQueue;
      if(client.music.data[guild.id].loop && !willSkip) {
        require("./Play.js")(client, guild, member, textChannel, video, true);
        return;
      }
      if (willSkip) data.index--;
      if (!client.music.queue[guild.id][data.index + 1]) {
        client.music.data[guild.id].skipQueue = false;
        client.music.data[guild.id].isPlaying = false;
        data.index = -1;
        client.music.playing[guild.id] = data;
      } else {
        require("./Play.js")(client, guild, member, textChannel, client.music.queue[guild.id][data.index + 1]);
      }
    });


  if (!isSkipped) textChannel.send(`• Started playing: **${video.title}**`)

  return undefined;
}