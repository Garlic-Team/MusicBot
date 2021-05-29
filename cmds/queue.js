const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "queue",
    description: "See queue",
    guildOnly: "847485277484220447",
    aliases: ["list","q"],
    run: async({client, interaction, respond, guild, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });
      let msgId = Date.now();

      let arrows = ["⬐","⬑"];
      let dots = "…";

      let format = [];
      let fill = () => {
        format = [];
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
        return isEmpty;
      };
      let isEmpty = fill();
      
      let embed = new MessageEmbed()
        .setAuthor("Music Buttons | Queue")
        .setDescription(`\`\`\`nim\n${format.join("\n")}\`\`\``)
        .setColor("#cf293f");

      let skipButton = new MessageButton().setLabel("Skip").setEmoji({name:"right",id:"847841719303012403"}).setStyle("red").setID(`${msgId}_skip`).setDisabled(isEmpty)

      let buttonEvent = async (button) => {
        if (button.id.split("_")[0] === msgId.toString()) {
          if (button.clicker.user.id === member.id) {
            if (client.music.playing[guild.id].connection) client.modules.get("Skip")(client, button.clicker.member);
            else return button.defer();

            button.defer();
            setTimeout(async () => {
              let buttonId = button.id.split("_")[1];
              let isEmpty = fill();
              embed.setDescription(`\`\`\`nim\n${format.join("\n")}\`\`\``);

              button.edit({
                content: embed,
                components: skipButton.setDisabled(isEmpty),
                edited: false
              });
            }, 5000);
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
        components: skipButton
      })
    }
}