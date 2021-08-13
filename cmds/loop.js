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
      let enable = new MessageButton().setLabel("Single Loop").setStyle("blurple").setCustomId(`enableLoop`),
        disable = new MessageButton().setLabel("Queue Loop").setStyle("blurple").setCustomId(`enableQueueLoop`),
        cancel = new MessageButton().setLabel("Disable").setStyle("red").setCustomId(`disableLoop`);
      buttonRow.addComponent(enable)
      buttonRow.addComponent(disable)
      buttonRow.addComponent(cancel)
      
      var msg = await respond({
        content: "• Turn the loop system queue type/single type/off.",
        components: buttonRow
      })

      if (client.music.data[guild.id].loop) enable.setDisabled();
      else disable.setDisabled();

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.user.id === member.id) {
            let buttonId = button.customId;

            if(buttonId == "enableLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = true
              client.music.data[guild.id].loopqueue = false;
              enable.setDisabled();
              disable.setDisabled(false);
              cancel.setDisabled(false);
            } else if(buttonId == "disableLoop" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].loop = false
              client.music.data[guild.id].loopqueue = false;
              cancel.setDisabled();
              disable.setDisabled(false);
              enable.setDisabled(false);
            } else if(buttonId == "enableQueueLoop" && client.music.playing[guild.id].connection) {
                client.music.data[guild.id].loop = false;
                client.music.data[guild.id].loopqueue = true;
                disable.setDisabled();
                enable.setDisabled(false);
                cancel.setDisabled(false);
            }
            /*} else if(buttonId == "loopCancel") {
              enable.setDisabled()
              disable.setDisabled()
              cancel.setDisabled()

              return button.edit({
                content: `• The loop system turned ${client.music.data[guild.id].loop ? "on" : "off"}`,
                components: buttonRow,
                edited: false
              })
            }*/

            button.edit({
              content: `• The loop system turned ${client.music.data[guild.id].loop ? "on Single Loop" : client.music.data[guild.id].loopqueue ? "on Queue Loop" : "off"}`,
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
