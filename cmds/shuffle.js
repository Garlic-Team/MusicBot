const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "shuffle",
    description: "Shuffle queue",
    guildOnly: "847485277484220447",
    aliases: ["shuf"],
    run: async({client, interaction, respond, guild, edit, member}) => {
      let msgId = Date.now();
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");

      let again = new MessageButton().setLabel("Again").setStyle("red").setID(`${msgId}_again`),
          cancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`${msgId}_shuffleCancel`);

      // shuffle
      let shuffleIt = () => {
        client.music.queue[guild.id] = client.music.queue[guild.id].sort(() => Math.floor(Math.random() * 10) > 5 ? -1 : 1);
        let qu = client.music.queue[guild.id];

        client.music.playing[guild.id].index = qu.findIndex((s) => s.playedAt === client.music.playing[guild.id].playedAt);
      }

      respond({
        content: `• Queue shuffled by ${member.user.tag}`,
        components: [[again, cancel]]
      });

      let buttonEvent = async (button) => {
        if (button.id.split("_")[0] === msgId.toString()) {
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id.split("_")[1];
            
            if(buttonId == "again") {
              if (!client.music.data[guild.id].isPlaying) {
                button.edit({
                  content: "• Shuffle cancelled",
                  components: [[again.setDisabled(), cancel.setDisabled()]]
                });
                client.removeListener("clickButton", buttonEvent);
                return;
              }

              // shuffle
              shuffleIt();
              button.edit({
                content: `• Queue shuffled again by ${button.clicker.user}`,
                components: [[again, cancel]]
              });
            } else if(buttonId == "shuffleCancel") {
              button.edit({
                content: "• Shuffle cancelled",
                components: [[again.setDisabled(), cancel.setDisabled()]]
              });
              client.removeListener("clickButton", buttonEvent);
            }
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