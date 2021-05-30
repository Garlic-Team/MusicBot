const express=require("express"),app=express();app.get("/",function(e,p){p.send("Hello World")}),app.listen(3e3);

const { Client, Collection } = require("discord.js"),
  { GCommands, Color } = require("gcommands"),
  fs = require("fs");

const client = new Client();

client.music = {
  queue: {},
  playing: {},
  data: {}
}
client.modules = new Collection();

/**
 * Load Music Modules
 */
for (let i = 0; i < fs.readdirSync(__dirname + "/modules").length; i++) {
  let f = fs.readdirSync(__dirname + "/modules")[i];
  try {
    client.modules.set(f.split(".")[0], require(`./modules/${f}`));
    console.log(new Color("&d[Modules] &e" + f.split(".")[0] + " &aloaded").getText())
  } catch(e) {
    console.log(new Color("&d[Modules] &e"+f.split(".")[0]+"&c" + e).getText());
  }
}

/**
 * Guild Events
 */
let updateGuildQueue = (ready) => {
  let gs = client.guilds.cache.array();
  for (let i = 0; i < gs.length; i++) {
    let g = gs[i];
    if (!client.music.queue[g.id]) client.music.queue[g.id] = [];
    if (!client.music.playing[g.id]) client.music.playing[g.id] = {};
    if (!client.music.data[g.id]) client.music.data[g.id] = {
      loop: false,
      isPlaying: false,
      djOnly: false
    };

    if (ready && g.me.voice && g.me.voice.channel) {
      g.me.voice.setChannel(null);
    }
  }
}

/**
 * Using GCommands v4 (dev build)
 */
client.setMaxListeners(50);
client.on("ready", () => {
  updateGuildQueue(true);
  const GCommandsClient = new GCommands(client, {
    cmdDir: "cmds/",
    unkownCommandMessage: false,
    language: "english",
    slash: {
        slash: 'both',
        prefix: '!'
    },
    defaultCooldown: 3,
  });
  client.user.setPresence({
    activity: {
      type: "COMPETING",
      name: "being the best music bot"
    },
    status: "idle"
  });

  /*client.dispatcher.addInhibitor(async(cmd, {member, respond}) => {
    let cmdBlacklist = ["help"];
    if (cmdBlacklist.includes(cmd.name)) return true;

    let djCmds = ["back","jump","leave","loop","shuffle","skip","volume","remove","clearqueue","stop","pause"];
    let hasPermissions = await client.modules.get("CheckPermissions")(client, member, djCmds.includes(cmd.name) ? "dj" : "default");

    if (!hasPermissions) {
      respond({ content: ":x: *Insufficient permissions*", ephemeral: true });
      return false;
    } else {
      return true;
    }

    return true;
  })*/

  GCommandsClient.on("debug", console.log);
});

client.on("guildCreate", updateGuildQueue);
client.on("guildDelete", updateGuildQueue);

client.login(process.env.token);
"Hint: hit control+c anytime to enter REPL.";