const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "shuffle",
    description: "Shuffle queue",
    aliases: ["shuf"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}) => {
      let msgId = Date.now();
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");

      let buttonRow = new MessageActionRow()
      let again = new MessageButton().setLabel("Again").setStyle("red").setID(`again`),
          cancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`shuffleCancel`);
      buttonRow.addComponent(again)
      buttonRow.addComponent(cancel)

      // shuffle
      let shuffleIt = () => {
        client.music.queue[guild.id] = client.music.queue[guild.id].sort(() => Math.floor(Math.random() * 10) > 5 ? -1 : 1);
        let qu = client.music.queue[guild.id];

        client.music.playing[guild.id].index = qu.findIndex((s) => s.playedAt === client.music.playing[guild.id].playedAt);
      }

      let msg = await respond({
        content: `• Queue shuffled by ${member.user.tag}`,
        components: buttonRow
      });

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id.split("_")[1];
            
            if(buttonId == "again") {
              if (!client.music.data[guild.id].isPlaying) {
                again.setDisabled()
                cancel.setDisabled()
                
                button.edit({
                  content: "• Shuffle cancelled",
                  components: buttonRow
                });
                client.removeListener("clickButton", buttonEvent);
                return;
              }

              // shuffle
              shuffleIt();
              button.edit({
                content: `• Queue shuffled again by ${button.clicker.user}`,
                components: buttonRow
              });
            } else if(buttonId == "shuffleCancel") {
              again.setDisabled()
              cancel.setDisabled()
              
              button.edit({
                content: "• Shuffle cancelled",
                components: buttonRow
              });
              client.removeListener("clickButton", buttonEvent);
            }
          }
        };
      }

      client.on("clickButton", buttonEvent);
      setTimeout(() => {
        client.removeListener("clickButton", buttonEvent);
      }, 60000);
    }
}