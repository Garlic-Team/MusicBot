const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "remove",
    description: "Removes a song from the queue",
    args: [
      {
        name: "position",
        description: "The position to remove",
        type: 4,
        required: true
      }
    ],
    aliases: ["rem","re"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice.channel) return error("You aren't connected to a VC");
      
      if (!args[0] || !parseInt(args[0]) || parseInt(args[0]) < 1) return error("Invalid number");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let ind = parseInt(args[0]) - 1;
      if (!client.music.queue[guild.id][ind]) return error("That position doesn't exist");
      client.music.queue[guild.id].splice(ind, 1);
      if (client.music.playing[guild.id].index === ind) {
        if (ind + 1 > client.music.queue[guild.id].length - 1) client.music.playing[guild.id].index = -1;
        else client.music.playing[guild.id].index = ind;

        client.music.playing[guild.id].connection.dispatcher.end();
      }

      respond({ content: "• Removed!" });
    }
}
