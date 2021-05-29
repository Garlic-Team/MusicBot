const fs = require("fs");

module.exports = (member, perm) => {
  let rolePermissions = JSON.parse(fs.readFileSync(__dirname + "/../options/rolePermissions.json", "utf8"));
  for (let i = 0; i < Object.keys(rolePermissions).length; i++) {
    let key = Object.keys(rolePermissions)[i];
    let value = rolePermissions[key];
    if (value === "-") delete rolePermissions[key];
  }

  let reqPerm = rolePermissions[perm];

  if (client.music.data[guild.id].djOnly && rolePermissions.dj && !member.roles.cache.has(rolePermissions.dj) || !client.music.data[guild.id].djOnly && reqPerm && !member.roles.cache.has(reqPerm)) return false;

  return true;
}