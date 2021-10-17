const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "clearqueue",
    description: "Clears the queue",
    aliases: ["clr","clear","clearq","clrqueue","deletequeue","delqueue","clearq","deleteq"],
    clientRequiredPermissions: ["SEND_MESSAGES"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice.channel) return error("You aren't connected to a VC");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      client.music.queue[guild.id] = [];
      client.music.playing[guild.id].connection.dispatcher.end();

      respond({ content: "• Cleared!" });
    }
}
