const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "leave",
    description: "Leaves the VC",
    aliases: ["dc","disconnect"],
    clientRequiredPermissions: ["SEND_MESSAGES"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice.channel) return error("You aren't connected to a VC");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      client.music.playing[guild.id].connection.disconnect();
      respond({ content: "• I left the VC" });
    }
}