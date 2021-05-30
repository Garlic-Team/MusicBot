const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");
const ProgressBar = require("../utils/EmojiProgressBar.js");
const FormatTime = require("../utils/FormatTime.js");

module.exports = {
    name: "nowplaying",
    description: "Shows the current song",
    aliases: ["np"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member, message}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");

      let song = client.music.playing[guild.id];

      let timeEnd = (song.playedAt + song.video.duration);
      let left = timeEnd - Date.now();
      let currTime = song.video.duration - left;

      let embed = new MessageEmbed()
        .setAuthor(song.video.title)
        .setTitle("Music Buttons | Now Playing")
        .setThumbnail(song.video.thumbnail.url)
        .setDescription(`*Requested by: **${song.request.tag}** (${song.request})*`);

        if (song.video.live) {
          embed.addField("Time", `:red_circle: **LIVE**`);
        } else {
          embed.addField("Time", `${new ProgressBar(currTime / song.video.duration, 15, client, !!message).toEmoji()}\n**${new FormatTime(Math.floor(currTime / 1000))} / ${new FormatTime(Math.floor(song.video.duration / 1000))} - ${new FormatTime(Math.floor((song.video.duration - currTime) / 1000))} left (${Math.floor((currTime / song.video.duration) * 100)}%)**`);
        }

        embed.addField("Author", song.video.channel.name, true);
        if (song.video.views) embed.addField("Views", song.video.views, true);
        if (song.video.playlist) embed.addField("Playlist", `[${song.video.playlist.name}](${song.video.playlist.url})`, true);
        embed.setColor("#cf293f");

      respond(embed);
    }
}