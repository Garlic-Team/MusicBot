const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "queue",
    description: "See queue",
    aliases: ["list","q"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      let arrows = ["⬐","⬑"];
      let dots = "…";
      let format = [];
      let pages = [];
      let page = 0;

      let fill = () => {
        format = [];
        pages = [];
        for (let i = 0; i < client.music.queue[guild.id].length; i++) {
          let video = client.music.queue[guild.id][i];
          let prefix = ``;
          let suffix = ``;

          if (client.music.playing[guild.id].index === i) {
            let startOffset = " ".repeat(2 + (i + 1).toString().length)
            prefix = `${startOffset}${arrows[0]} Currently Playing\n`;
            suffix = `\n${startOffset}${arrows[1]} Currently Playing`;
          }

          format.push(`${prefix}${i + 1}) ${video.title.length > 53 ? `${video.title.slice(0, 53)}${dots}` : video.title}${suffix}`);
        }

        let isEmpty = format.length < 1;
        if (format.length < 1) format.push("The queue is empty!");
        let max = 7;
        for (let i = 0; true; i += max) {
          if (i >= format.length) break;
          else {
            pages.push(format.slice(i, i + max));
          }
        }
        return isEmpty;
      };
      let isEmpty = fill();
      
      let embed = new MessageEmbed()
        .setAuthor("Music Buttons | Queue")
        .setTitle(`Page ${page}`)
        .setDescription(`\`\`\`nim\n${pages[page].join("\n")}\`\`\``)
        .setColor("#cf293f");

      let skipButton = new MessageButton().setLabel("Skip").setEmoji("<:right:847841719303012403>").setStyle("red").setID(`skip`).setDisabled(isEmpty);
      let pageL = new MessageButton().setLabel("Previous Page").setEmoji("<:left:847841719327260682>").setStyle("gray").setID(`pageL`).setDisabled(page === 0);
      let pageR = new MessageButton().setLabel("Next Page").setEmoji("<:right:847841719303012403>").setStyle("gray").setID(`pageR`).setDisabled(page === pages.length - 1);
      let cancel = new MessageButton().setLabel("Cancel").setStyle("blurple").setID(`cancel`);

      let genRow = () => {
        let buttonRow = new MessageActionRow();
        buttonRow.addComponent(skipButton);
        buttonRow.addComponent(pageL);
        buttonRow.addComponent(pageR);
        buttonRow.addComponent(cancel);
        return buttonRow;
      }

      let msg = await respond({
        content: embed,
        allowedMentions: { parse: [], repliedUser: true },
        components: genRow()
      })

      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.user.id === member.id) {
            if (button.id === "pageL" && page > 0) page--;
            if (button.id === "pageR" && page < pages.length) page++;
            if (button.id === "skip" && client.music.playing[guild.id].connection) client.modules.get("Skip")(client, button.clicker.member);
            if (button.id === "cancel") {
              skipButton.setDisabled()
              pageL.setDisabled()
              pageR.setDisabled()
              cancel.setDisabled()

              button.edit({
                content: embed,
                allowedMentions: { parse: [], repliedUser: true },
                components: genRow()
              });
              return client.removeListener("clickButton", buttonEvent);
            }

            isEmpty = fill();
            skipButton.setDisabled(isEmpty);
            pageL.setDisabled(page === 0);
            pageR.setDisabled(page === pages.length - 1);

            embed = new MessageEmbed()
              .setAuthor("Music Buttons | Queue")
              .setTitle(`Page ${page}`)
              .setDescription(`\`\`\`nim\n${pages[page].join("\n")}\`\`\``)
              .setColor("#cf293f");

            button.edit({
              content: embed,
              allowedMentions: { parse: [], repliedUser: true },
              components: genRow()
            });
          }
        };
      }
      client.on("clickButton", buttonEvent);
    }
}