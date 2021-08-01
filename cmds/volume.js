const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "volume",
    description: "Set new volume",
    args: [
      {
        name: "volume",
        description: "Volume (integer)",
        type: 4,
        required: false
      }
    ],
    aliases: ["vol"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice.channel) return error("You aren't connected to a VC");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let buttonRow = new MessageActionRow(),
          volumeButtonPlus = new MessageButton().setLabel("+ 5").setStyle("green").setID(`volume+`),
          volumeButtonMinus = new MessageButton().setLabel("- 5").setStyle("red").setID(`volume-`),
          volumeButtonCancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`volumeCancel`)
      buttonRow.addComponent(volumeButtonPlus)
      buttonRow.addComponent(volumeButtonMinus)
      buttonRow.addComponent(volumeButtonCancel)

      if(args[0]) {
        if(!parseInt(args[0]) || args[0] > 100 || args[0] < 0) return error("Please set valid integer. `(0-100)`");

        if (client.music.playing[guild.id].connection) client.music.playing[guild.id].connection.dispatcher.setVolumeLogarithmic(parseInt(args[0]) / 100)
        
        respond({ content: `• New volume is: \`${args[0]}%\`` });
        return;
      }

      let msg = await respond({
        content:"• Please set new volume",
        components: buttonRow
      })

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id;
            let nowVolume = client.music.playing[guild.id].connection.dispatcher.volumeLogarithmic * 100;

            let newVolume = nowVolume;
            if(buttonId == "volume+") {
              newVolume += 5;
              if (newVolume > 100) newVolume = 100;

              if (newVolume >= 100) volumeButtonPlus.setDisabled(true);
              else volumeButtonPlus.setDisabled(false);
              if (newVolume <= 0) volumeButtonMinus.setDisabled(true);
              else volumeButtonMinus.setDisabled(false);
              button.edit({
                content: `• New volume is: \`${Math.round(newVolume)}%\``,
                components: buttonRow
              });
              
              client.music.playing[guild.id].connection.dispatcher.setVolumeLogarithmic(newVolume / 100);
            } else if(buttonId == "volume-") {
              newVolume -= 5;
              if (newVolume < 0) newVolume = 0;

              if (newVolume >= 100) volumeButtonPlus.setDisabled(true);
              else volumeButtonPlus.setDisabled(false);
              if (newVolume <= 0) volumeButtonMinus.setDisabled(true);
              else volumeButtonMinus.setDisabled(false);
              button.edit({
                content: `• New volume is: \`${Math.round(newVolume)}%\``,
                components: buttonRow
              });

              client.music.playing[guild.id].connection.dispatcher.setVolumeLogarithmic(newVolume / 100);
            } else if(buttonId == "volumeCancel") {
              client.removeListener("clickButton", buttonEvent);

              volumeButtonPlus.setDisabled()
              volumeButtonMinus.setDisabled()
              volumeButtonCancel.setDisabled()

              button.edit({
                content: `• Final volume is: \`${Math.round(newVolume)}%\``,
                components: buttonRow
              });
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
