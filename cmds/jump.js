const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "jump",
    description: "Jumps to a song",
    args: [
      {
        name: "position",
        description: "The position to jump to",
        type: 4,
        required: true
      }
    ],
    aliases: ["j"],
    clientRequiredPermissions: ["SEND_MESSAGES","CONNECT","SPEAK"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });
      
      if (!member.voice.channel) return error("You aren't connected to a VC");

      if (!args[0] || !parseInt(args[0]) || !parseInt(args[1]) < 0) return error("Invalid number");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let response = client.modules.get("Skip")(client, member, parseInt(args[0]) - 1, true);
      if (response) return error(response);

      respond({ content: "• Jumped!", ephemeral: true });
    }
}
