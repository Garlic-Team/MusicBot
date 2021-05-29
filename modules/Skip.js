const { MessageButton } = require("gcommands");
const rolePermissions = require("../options/rolePermissions.json");

module.exports = (client, member) => {
  let guild = member.guild;
  for (let i = 0; i < Object.keys(rolePermissions).length; i++) {
    let key = Object.keys(rolePermissions)[i];
    let value = rolePermissions[key];
    if (value === "-") delete rolePermissions[key];
  }

  let hasPerms = client.modules.get("CheckPermissions")(member, "default");
  if (!hasPerms) return "Insufficient permissions";

  let data = client.music.playing[guild.id];

  data.connection.dispatcher.end();

  return undefined;
}