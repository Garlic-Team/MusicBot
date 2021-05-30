const { MessageButton } = require("gcommands");

module.exports = (client, member, add = 1, forceSet = false) => {
  let guild = member.guild;

  let data = client.music.playing[guild.id];
  let ind = client.music.playing[guild.id].index;
  let qu = client.music.queue[guild.id];

  let newIndex = ind + add;
  if (forceSet) newIndex = add;

  if (qu[newIndex]) {
    client.music.playing[guild.id].index = newIndex - 1;
    require("./Play.js")(client, guild, member, data.textChannel, qu[newIndex]);
  } else {
    if (forceSet) return "That position is not in the queue";
    else {
      client.music.playing[guild.id].index = -10;
      data.connection.dispatcher.end();
    }
  }

  return undefined;
}