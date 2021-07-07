const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "djonly",
    description: "Enable/disable dj only",
    aliases: ["dj","djo"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      let buttonRow = new MessageActionRow()
      let enable = new MessageButton().setLabel("Enable").setStyle("green").setID(`enableDJ`),
          disable = new MessageButton().setLabel("Disable").setStyle("red").setID(`disableDJ`),
          cancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`DJCancel`);
      buttonRow.addComponent(enable)
      buttonRow.addComponent(disable)
      buttonRow.addComponent(cancel)
      
      let msg = await respond({
        content: "• Turn DJ Only on/off",
        components: [[enable, disable, cancel]]
      });

      if (client.music.data[guild.id].djOnly) enable.setDisabled();
      else disable.setDisabled();

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id;

            if(buttonId == "enableDJ" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].djOnly = true;
              enable.setDisabled();
              disable.setDisabled(false);
            } else if(buttonId == "disableDJ" && client.music.playing[guild.id].connection) {
              client.music.data[guild.id].djOnly = false;
              disable.setDisabled();
              enable.setDisabled(false);
            } else if(buttonId == "djCancel") {
              enable.setDisabled()
              disable.setDisabled()
              cancel.setDisabled()

              client.removeListener("clickButton", buttonEvent);
              return button.edit({
                content: `• DJ Only turned ${client.music.data[guild.id].loop ? "on" : "off"}`,
                components: buttonRow,
                edited: false
              })
            }

            button.edit({
              content: `• DJ Only turned ${client.music.data[guild.id].loop ? "on" : "off"}`,
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