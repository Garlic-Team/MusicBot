const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "loop",
    description: "Enable/disable loop",
    guildOnly: "847485277484220447",
    run: async({client, interaction, respond, guild, edit, member}) => {
      let msgId = Date.now();
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice) return error("You aren't connected to a VC");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let enable = new MessageButton().setLabel("Enable").setStyle("green").setID(`${msgId}_enableLoop`)
          disable = new MessageButton().setLabel("Disable").setStyle("red").setID(`${msgId}_disableLoop`)
          cancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`${msgId}_loopCancel`)
      
      respond({
        content: "• Turn the loop system on/off.",
        components: [[enable, disable, cancel]]
      })

      let buttonEvent = async (button) => {
        if (button.id.split("_")[0] === msgId.toString()) {
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id.split("_")[1];

            if(buttonId == "enableLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = true
              enable.setDisabled()
              disable.setDisabled(false)
            } else if(buttonId == "disableLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = false
              disable.setDisabled()
              enable.setDisabled(false)
            } else if(buttonId == "loopCancel") {
              return button.edit({
                content: `• The loop system turned ${client.music.data[guild.id].loop ? "on" : "off"}`,
                components: [[enable.setDisabled(), disable.setDisabled(), cancel.setDisabled()]],
                edited: false
              })
            }

            button.edit({
              content: `• The loop system turned ${client.music.data[guild.id].loop ? "on" : "off"}`,
              components: [[enable, disable, cancel]],
              edited: false
            });
          } else {
            button.defer();
          }
        };
      }
      client.on("clickButton", buttonEvent);
      setTimeout(() => {
        client.removeListener("clickButton", buttonEvent);
      }, 60000);
    }
}