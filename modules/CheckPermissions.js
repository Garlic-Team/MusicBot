const fs = require("fs");

module.exports = async(client, member, perm) => {
  let guild = member.guild;
  let rolePermissions = JSON.parse(fs.readFileSync(__dirname + "/../options/rolePermissions.json", "utf8"));
  for (let i = 0; i < Object.keys(rolePermissions).length; i++) {
    let key = Object.keys(rolePermissions)[i];
    let value = rolePermissions[key];
    if (value === "-") delete rolePermissions[key];
  }

  let reqPerm = rolePermissions[perm];

  if (member.voice && client.music.data[guild.id].isPlaying) {
    if (member.voice.channel.id === client.music.playing[guild.id].channel.id && member.voice.channel.member.size <= 2) return true;
  }

  if (client.music.data[guild.id].djOnly && rolePermissions.dj && !member.roles.cache.has(rolePermissions.dj) || !client.music.data[guild.id].djOnly && reqPerm && !member.roles.cache.has(reqPerm)) return false;

  return true;
}