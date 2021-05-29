const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "help",
    description: "All commands",
    guildOnly: "847485277484220447",
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let msgId = Date.now();
      let allcmds = client.commands.map((cmd) => `• \`${cmd.name}\``);
      
      let embed = new MessageEmbed()
        .setAuthor("Music Buttons | Help")
        .setDescription(allcmds.join("\n"))
        .setColor("#cf293f");

      let parseBtns = (btns) => {
        let final = [];
        let max = 5;
        for (let i = 0; true; i += max) {
          if (i >= btns.length) break;
          else {
            final.push(btns.slice(i, i + max));
          }
        }
        
        return final;
      }

      let buttons = client.commands.map((cmd) => new MessageButton().setStyle("red").setLabel(cmd.name).setID(`${msgId}_${cmd.name}`));

      let buttonEvent = async (button) => {
        if (button.id.split("_")[0] === msgId.toString()) {
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id.split("_")[1];
            let cmd = client.commands.get(buttonId);

            button.edit({
              content: new MessageEmbed().setAuthor("Music Buttons | Help").setColor("#cf293f").setDescription(`${cmd.name}\n• \`${cmd.description}\``),
              components: parseBtns(buttons.map(btn => {
                if(btn.custom_id.split("_")[1] == buttonId) btn.setDisabled()
                else btn.setDisabled(false)
                return btn;
              })),
              edited: false
            })
          } else {
            button.defer();
          }
        };
      }      
      client.on("clickButton", buttonEvent);
      setTimeout(() => {
        client.removeListener("clickButton", buttonEvent);
      }, 60000);

      respond({
        content: embed,
        allowedMentions: { parse: [], repliedUser: true },
        components: parseBtns(buttons)
      })
    }
}