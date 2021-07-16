const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "loop",
    description: "Enable/disable queue loop",
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice.channel) return error("You aren't connected to a VC");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let buttonRow = new MessageActionRow()
      let enable = new MessageButton().setLabel("Enable").setStyle("green").setID(`enableQueueLoop`),
        disable = new MessageButton().setLabel("Disable").setStyle("red").setID(`disableQueueLoop`),
        cancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`queueLoopCancel`);
      buttonRow.addComponent(enable)
      buttonRow.addComponent(disable)
      buttonRow.addComponent(cancel)
      
      var msg = await respond({
        content: "• Turn the queue loop system on/off.",
        components: buttonRow
      })

      if (client.music.data[guild.id].loopqueue) enable.setDisabled();
      else disable.setDisabled();

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id;

            if(buttonId == "enableQueueLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = true
              enable.setDisabled()
              disable.setDisabled(false)
            } else if(buttonId == "disableQueueLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = false
              disable.setDisabled()
              enable.setDisabled(false)
            } else if(buttonId == "queueLoopCancel") {
              enable.setDisabled()
              disable.setDisabled()
              cancel.setDisabled()

              return button.edit({
                content: `• The queue loop system turned ${client.music.data[guild.id].loopqueue ? "on" : "off"}`,
                components: buttonRow,
                edited: false
              })
            }

            button.edit({
              content: `• The queue loop system turned ${client.music.data[guild.id].loopqueue ? "on" : "off"}`,
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
