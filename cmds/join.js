const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "join",
    description: "Joins the VC",
    aliases: ["j"],
    clientRequiredPermissions: ["SEND_MESSAGES","CONNECT","SPEAK"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (client.music.data[guild.id].isPlaying) return error("I'm currently playing in a different VC");
      if (!member.voice.channel) return error("You aren't connected to a VC");

      let connection;
      try {
        connection = await member.voice.channel.join();
      } catch {
        return error("Couldn't join the VC");
      }
      client.music.playing[guild.id].connection = connection;
      client.music.playing[guild.id].channel = member.voice.channel;
      respond({ content: "• I joined the VC" });
    }
}