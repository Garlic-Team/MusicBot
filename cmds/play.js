const { MessageButton } = require("gcommands");
const { MessageEmbed } = require("discord.js");
const ytb = require("youtube-sr").default;

// ${Math.floor(Buffer.byteLength(JSON.stringify(res).length) / 1000)}
module.exports = {
    name: "play",
    description: "Play music",
    expectedArgs: [
      {
        name: "search",
        description: "Search term (accepts YouTube search, YouTube URLs)",
        type: 3,
        required: true
      }
    ],
    guildOnly: "847485277484220447",
    aliases: ["p","add"],
    run: async({client, interaction, respond, guild, channel, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!member.voice) return error("Please connect to a voice channel");
      if (client.music.playing[guild.id].channel && member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let term = args[0] ? args[0].toString() : undefined
      if(!term) return error("Please provide a search term.");

      let playAudio = async (button, video) => {
        if (button) {
          let video = vids[parseInt(button.id.split("_").slice(1))];
          client.removeListener("clickButton", buttonEvent);

          let editError = (c) => button.edit({
            content: `:x: *${c}*`,
            components: [buttons.map(btn => btn.setDisabled())],
            embeds: [],
            embed: [],
            edited: false
          });

          if (!member.voice) return editError("Please connect to a voice channel");

          // Play the Music
          video.host = host;
          video.request = member.user;
          video.index = client.music.queue[guild.id].length;
          client.music.queue[guild.id].push(video);
          
          let playIt = client.music.data[guild.id].isPlaying;

          if (playIt) {
            // Add to Queue
            button.edit({
              content: new MessageEmbed().setAuthor(video.channel.name).setTitle(video.title)
              .setDescription(`• **Duration:** ${video.durationFormatted}`).setURL(`https://www.youtube.com/watch?v=${video.id}`).setImage(video.thumbnail.url).setColor("#cf293f"),
              components: new MessageButton().setLabel("Added to Queue").setStyle("gray").setID("queuebutton").setDisabled(),
              edited: false
            });
          } else {
            // Play the Music
            let resp = await (client.modules.get("Play"))(client, guild, member, channel, video);
            if (resp) return editError(resp);

            button.edit({
              content: new MessageEmbed().setAuthor(video.channel.name).setTitle(video.title)
              .setDescription(`• **Duration:** ${video.durationFormatted}`).setURL(`https://www.youtube.com/watch?v=${video.id}`).setImage(video.thumbnail.url).setColor("#cf293f"),
              components: new MessageButton().setLabel("Playing").setStyle("gray").setID("playingbutton").setDisabled(),
              edited: false
            });
          }
        } else if (video) {
          // Play the Music
          video.duration = video.duration * 1000;
          video.host = host;
          video.request = member.user;
          video.index = client.music.queue[guild.id].length;
          client.music.queue[guild.id].push(video);
          
          let playIt = client.music.data[guild.id].isPlaying;

          if (playIt) {
            // Add to Queue
            respond({
              content: new MessageEmbed().setAuthor(video.channel.name).setTitle(video.title)
              .setDescription(`• **Duration:** ${video.durationFormatted}`).setURL(`https://www.youtube.com/watch?v=${video.id}`).setImage(video.thumbnail.url).setColor("#cf293f"),
              components: new MessageButton().setLabel("Added to Queue").setStyle("gray").setID("queuebutton").setDisabled()
            });
          } else {
            // Play the Music
            let resp = await (client.modules.get("Play"))(client, guild, member, channel, video);
            if (resp) return editError(resp);

            respond({
              content: new MessageEmbed().setAuthor(video.channel.name).setTitle(video.title)
              .setDescription(`• **Duration:** ${video.durationFormatted}`).setURL(`https://www.youtube.com/watch?v=${video.id}`).setImage(video.thumbnail.url).setColor("#cf293f"),
              components: new MessageButton().setLabel("Playing").setStyle("gray").setID("playingbutton").setDisabled(),
            });
          }
        }
      }
      
      let host = "YouTube";
      // Check Url
      if (ytb.validate(term, "PLAYLIST")) return error("Playlists are not yet supported");
      if (ytb.validate(term, "VIDEO")) {
        playAudio(undefined, await ytb.getVideo(term));
        return;
      }

      let vids = await ytb.search(term, { limit: 5 });

      if(vids.length == 0) return error("Please provide a search valid term.");

      let audioID = Date.now();

      let buttons = vids.map((vid, vidY) => new MessageButton().setStyle("red").setLabel(vidY + 1).setID(`${audioID}_${vidY}`));

      let emb = new MessageEmbed().setColor("#7289DA").setTitle(`${host} | Search Results`).setDescription(vids.map((vid, vidY) => `**\`${vidY + 1})\`** [${vid.title}](https://www.youtube.com/watch?v=${vid.id})`).join("\n"));

      let msg = await respond({
        content: emb,
        components: [buttons],
        thinking: false
      });

      let buttonEvent = async (button) => {
        if (button.id.split("_")[0] === audioID.toString()) {
          if (button.clicker.user.id === member.id) {
            playAudio(button);
          } else {
            button.defer();
          }
        };
      }
      
      client.on("clickButton", buttonEvent);
    }
};