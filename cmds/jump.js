const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "jump",
    description: "Jumps to a song",
    guildOnly: "847485277484220447",
    expectedArgs: [
      {
        name: "position",
        description: "The position to jump to",
        type: 4,
        required: true
      }
    ],
    alises: ["j"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });
      
      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice) return error("You aren't connected to a VC");

      if (!args[1] || !parseInt(args[1]) || !parseInt(args[1]) < 1) return error("Invalid number");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let response = client.modules.get("Skip")(client, member, parseInt(args[1]) - 1, true);
      if (response) return error(response);

      respond({ content: "• Jumped!", ephemeral: true });
    }
}