const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "help",
    description: "All commands",
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let allcmds = client.gcommands.map((cmd) => `• \`${cmd.name}\``);
      
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
            let slauc = btns.slice(i, i + max);
            let row = new MessageActionRow();
            for (let j = 0; j < slauc.length; j++) {
              row.addComponent(slauc[j]);
            }
            final.push(row);
          }
        }
        // ono to musi returnovat ten row
        // tak jak tam ale dáme víc rows
        // to musis creatnut dalsi row ako MessageActionRow yep
        // na dalsiu row to musi spravit MessageActionRow dalsiu
        // ked chces 2 buttons v 1 row tak das row.addComponent(button) row.addComponent(button) a to su 2 buttons v 1 row
        // já ale myslím víc rows
        // no to musis dat pre kazdu row new MessageActionRow()
        // ide aj MessageActionRow(object) a z toho to dá do action rowu ale to asi nehelplo
        // takto ja ti pošlem object ako to musí vyzerať wait na dc
        // takže to bude components: [[MessageActionRow, MessageActionRow]]? [MessageActionRow, MessageActionRow] iba 1x []
        // no tak to teďka je hm
        // na dc poslem jednu vec

        return final;
      }
      
      let buttons = client.gcommands.map((cmd) => new MessageButton().setStyle("red").setLabel(cmd.name).setID(`${cmd.name}`));

      let msg = await respond({
        content: embed,
        allowedMentions: { parse: [], repliedUser: true },
        components: parseBtns(buttons)
      })

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.user.id === member.id) {
            let buttonId = button.id;
            let cmd = client.gcommands.get(buttonId);

            button.message.edit({
              content: new MessageEmbed().setAuthor("Music Buttons | Help").setColor("#cf293f").setDescription(`${cmd.name}\n• \`${cmd.description}\``),
              components: parseBtns(buttons.map(btn => {
                if(btn.custom_id == buttonId) btn.setDisabled()
                else btn.setDisabled(false)
                return btn;
              })),
            })
          }
        };
      }      
      client.on("clickButton", buttonEvent);
      setTimeout(() => {
        client.removeListener("clickButton", buttonEvent);
      }, 60000);
    }
}
