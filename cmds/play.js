const { MessageButton, MessageActionRow } = require("gcommands");
const { MessageEmbed } = require("discord.js");
const ytb = require("youtube-sr").default;
const DeepCopy = require("../utils/DeepCopy.js");

// ${Math.floor(Buffer.byteLength(JSON.stringify(res).length) / 1000)}
module.exports = {
    name: "play",
    description: "Play music",
    args: [
      {
        name: "search",
        description: "Search term (accepts YouTube search, YouTube URLs)",
        type: 3,
        required: true
      }
    ],
    aliases: ["p","add"],
    clientRequiredPermissions: ["SEND_MESSAGES","EMBED_LINKS","CONNECT","SPEAK"],
    run: async({client, interaction, respond, guild, channel, edit, member}, args) => {
      let error = (c) => respond({ content: `:x: *${c}*`, ephemeral: true });

      if (!member.voice.channel) return error("Please connect to a voice channel");
      if (client.music.playing[guild.id].channel && member.voice.channel.id !== client.music.playing[guild.id].channel.id) return error("The bot is in a different VC");

      let term = args[0] ? args.slice(0).join(" ") : undefined
      if(!term) return error("Please provide a search term.");

      let videos;
      
      let buttonEvent = async (button) => {
        if (button.message.id === msg.id) {
          button.defer();
          if (button.clicker.member.id === member.id) {
            let video = videos[parseInt(button.id)];
            playAudio(button, video);
          }
        };
      }

      let msg;

      let playAudio = async (button, video) => {
        let embed;

        if(video && !video.videos && video.duration === 0) video.live = true;


       if (video && !video.videos) embed = new MessageEmbed().setAuthor(video.channel.name).setTitle(video.title)
              .setDescription(video.live ? "• **LIVE**" : `• **Duration:** ${video.durationFormatted}`).setURL(`https://www.youtube.com/watch?v=${video.id}`).setImage(video.thumbnail.url).setColor("#cf293f");

        if (button) {
          let buttonRow = new MessageActionRow()
          let i = 0;
          buttons.map(btn => {
            buttonRow.addComponent(btn.components[i].setDisabled())
            i++
          })

          let editError = (c) => button.edit({
            content: `:x: *${c}*`,
            components: buttonRow,
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
              content: embed,
              components: new MessageActionRow().addComponent(new MessageButton().setLabel("Added to Queue").setStyle("gray").setID("queuebutton").setDisabled())
            });
          } else {
            // Play the Music
            let resp = await (client.modules.get("Play"))(client, guild, member, channel, video, undefined, undefined, true); 
            if (resp) return editError(resp);

            button.edit({
              content: embed,
              components: new MessageActionRow().addComponent(new MessageButton().setLabel("Playing").setStyle("gray").setID("playingbutton").setDisabled())
            });
          }
        } else if (Array.isArray(video.videos)) {
          // Parse the Playlist
          let playIt = client.music.data[guild.id].isPlaying;

          for (let i = 0; i < video.videos.length; i++) {
            let vid = video.videos[i];
            if (vid.duration === 0) vid.live = true;
            vid.host = host;
            vid.request = member.user;
            let videoClone = DeepCopy(video);
            delete videoClone.videos;
            vid.playlist = videoClone;
            vid.index = client.music.queue[guild.id].length;
            client.music.queue[guild.id].push(vid);
          }

          let parsedVids = video.videos.map(vid => `**${vid.index + 1})** [${vid.title}](https://www.youtube.com/watch?v=${vid.id}&list=${video.id})`);
          let defThumb = "https://i.ytimg.com/vi/e0d4HJmU8XI/maxresdefault.jpg";

          let playlistEmbed = new MessageEmbed().setAuthor(video.author ? video.author.name || "Unknown" : "Unknown").setURL(video.url).setTitle(video.title).setDescription().setThumbnail(video.thumbnail ? video.thumbnail.url ? video.thumbnail.url : defThumb : defThumb).setDescription(parsedVids.length > 10 ? `${parsedVids.slice(0, 10).join("\n")}\n**+${parsedVids.length - 10} more**` : parsedVids.slice(0, 10).join("\n")).setColor("#cf293f");

          if (playIt) {
            // Add to Queue
            respond({
              content: playlistEmbed,
              components: new MessageActionRow().addComponent(new MessageButton().setLabel("Added to Queue").setStyle("gray").setID("queuebutton").setDisabled())
            });
          } else {
            // Play the Music
            let resp = await (client.modules.get("Play"))(client, guild, member, channel, video.videos[0]);
            if (resp) return editError(resp);

            respond({
              content: playlistEmbed,
              components: new MessageActionRow().addComponent(new MessageButton().setLabel("Playing").setStyle("gray").setID("playingbutton").setDisabled())
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
              content: embed,
              components: new MessageActionRow().addComponent(new MessageButton().setLabel("Added to Queue").setStyle("gray").setID("queuebutton").setDisabled())
            });
          } else {
            // Play the Music
            let resp = await (client.modules.get("Play"))(client, guild, member, channel, video);
            if (resp) return editError(resp);

            respond({
              content: embed,
              components: new MessageActionRow().addComponent(new MessageButton().setLabel("Playing").setStyle("gray").setID("playingbutton").setDisabled()),
            });
          }
        }
        
        await client.removeListener("clickButton", buttonEvent);
      }
      
      let host = "YouTube";
      // Check Url
      try {
        if (ytb.validate(term, "PLAYLIST")) {
          playAudio(undefined, await ytb.getPlaylist(term));
          return;
        }
        if (ytb.validate(term, "VIDEO")) {
          playAudio(undefined, await ytb.getVideo(term));
          return;
        }
      } catch {
        error("Failed to play song. Please try again");
        return;
      }

      let vids = await ytb.search(term, { limit: 5 });
      videos = vids;

      if(vids.length == 0) return error("Please provide a search valid term.");

      let buttonRow = new MessageActionRow()

      let buttons = vids.map((vid, vidY) => buttonRow.addComponent(new MessageButton().setStyle("red").setLabel(vidY + 1).setID(`${vidY}`)));
        buttonRow.toJSON()

      let emb = new MessageEmbed().setColor("#7289DA").setTitle(`${host} | Search Results`).setDescription(vids.map((vid, vidY) => `**\`${vidY + 1})\`** [${vid.title}](https://www.youtube.com/watch?v=${vid.id})`).join("\n"));

      msg = await respond({
        content: emb,
        components: buttonRow,
        thinking: false
      });
      
      client.on("clickButton", buttonEvent);
    }
};
