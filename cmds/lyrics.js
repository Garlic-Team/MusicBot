const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");
const { requestLyricsFor } = require("solenolyrics");

module.exports = {
    name: "lyrics",
    description: "Show music text",
    aliases: ["lyr"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      
      let lyrics = await requestLyricsFor(client.music.playing[guild.id].video.title)
      if(!lyrics) return error("I didn't find the lyrics for this song.")

      let embed = new MessageEmbed()
        .setAuthor("Music Buttons | Lyrics")
        .setDescription(lyrics)
        .setColor("#cf293f");

      if (embed.description.length >= 2048)
        embed.description = `${embed.description.substr(0, 2045) + "…"}`;

      respond({
        content: embed
      })
    }
}