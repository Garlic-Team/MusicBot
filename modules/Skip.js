const { MessageButton } = require("gcommands");
const rolePermissions = require("../options/rolePermissions.json");

module.exports = (client, member, add = 1, forceSet = false) => {
  let guild = member.guild;
  for (let i = 0; i < Object.keys(rolePermissions).length; i++) {
    let key = Object.keys(rolePermissions)[i];
    let value = rolePermissions[key];
    if (value === "-") delete rolePermissions[key];
  }

  let hasPerms = client.modules.get("CheckPermissions")(member, "default");
  if (!hasPerms) return "Insufficient permissions";

  let data = client.music.playing[guild.id];
  let ind = client.music.playing[guild.id].index;
  let qu = client.music.queue[guild.id];

  let newIndex = ind + add;
  if (forceSet) newIndex = add;

  if (qu[newIndex]) {
    require("./Play.js")(client, guild, member, data.textChannel, qu[newIndex]);
    client.music.playing[guild.id].index = newIndex - 1;
    data.connection.dispatcher.end();
  } else {
    if (forceSet) return "That position is not in the queue";
    else {
      client.music.playing[guild.id].index = -10;
      data.connection.dispatcher.end();
    }
  }

  return undefined;
}