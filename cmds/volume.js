const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "volume",
    description: "Set new volume",
    guildOnly: "847485277484220447",
    expectedArgs: [
      {
        name: "volume",
        description: "Volume (integer)",
        type: 4,
        required: false
      }
    ],
    aliases: ["vol"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let msgId = Date.now();
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!client.music.data[guild.id].isPlaying) return error("I'm not playing anything");
      if (!member.voice) return error("You aren't connected to a VC");

      if (member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let volumeButtonPlus = new MessageButton().setLabel("+ 5").setStyle("green").setID(`${msgId}_volume+`),
          volumeButtonMinus = new MessageButton().setLabel("- 5").setStyle("red").setID(`${msgId}_volume-`)
          volumeButtonCancel = new MessageButton().setLabel("Cancel").setStyle("red").setID(`${msgId}_volumeCancel`)

      if(!args[0]) respond({content:"• Please set new volume", components:[[volumeButtonPlus, volumeButtonMinus, volumeButtonCancel]]})

      let buttonEvent = async (button) => {
        if (button.id.split("_")[0] === msgId.toString()) {
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id.split("_")[1];
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
                components: [[volumeButtonPlus, volumeButtonMinus, volumeButtonCancel]]
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
                components: [[volumeButtonPlus, volumeButtonMinus, volumeButtonCancel]]
              });

              client.music.playing[guild.id].connection.dispatcher.setVolumeLogarithmic(newVolume / 100);
            } else if(buttonId == "volumeCancel") {
              client.removeListener("clickButton", buttonEvent);

              button.edit({
                content: `• Final volume is: \`${Math.round(newVolume)}%\``,
                components: [[volumeButtonPlus.setDisabled(), volumeButtonMinus.setDisabled(), volumeButtonCancel.setDisabled()]]
              });
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


      if(!parseInt(args[0]) || args[0] > 100 || args[0] < 0) return error("Please set valid integer. `(0-100)`");
      if(args[0]) {
        if (client.music.playing[guild.id].connection) client.music.playing[guild.id].connection.dispatcher.setVolumeLogarithmic(parseInt(args[0]) / 100)
        
        respond({ content: `• New volume is: \`${args[0]}%\`` });
      }
    }
}