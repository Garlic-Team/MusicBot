const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "loop",
    description: "Enable/disable loop",
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice.channel) return error("You aren't connected to a VC");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let buttonRow = new MessageActionRow()
      let enable = new MessageButton().setLabel("Enable").setStyle("green").setID(`enableLoop`),
        disable = new MessageButton().setLabel("Disable").setStyle("red").setID(`disableLoop`),
        cancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`loopCancel`);
      buttonRow.addComponent(enable)
      buttonRow.addComponent(disable)
      buttonRow.addComponent(cancel)
      
      var msg = await respond({
        content: "• Turn the loop system on/off.",
        components: buttonRow
      })

      if (client.music.data[guild.id].loop) enable.setDisabled();
      else disable.setDisabled();

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id;

            if(buttonId == "enableLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = true
              enable.setDisabled()
              disable.setDisabled(false)
            } else if(buttonId == "disableLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = false
              disable.setDisabled()
              enable.setDisabled(false)
            } else if(buttonId == "loopCancel") {
              enable.setDisabled()
              disable.setDisabled()
              cancel.setDisabled()

              return button.edit({
                content: `• The loop system turned ${client.music.data[guild.id].loop ? "on" : "off"}`,
                components: buttonRow,
                edited: false
              })
            }

            button.edit({
              content: `• The loop system turned ${client.music.data[guild.id].loop ? "on" : "off"}`,
              components: buttonRow,
              edited: false
            });
          }
        };
      }
      client.on("clickButton", buttonEvent);
      setTimeout(() => {
        client.removeListener("clickButton", buttonEvent);
      }, 60000);
    }
}