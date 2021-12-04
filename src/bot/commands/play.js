const { Command, ArgumentType } = require("gcommands");
const Player = require("../structures/Music/Player");
const { isUrl, search, getVideo } = require("../structures/Utils");

class Play extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            description: 'Play song',
            guildOnly: '747526604116459691',
            args: [
                {
                    name: 'query',
                    description: 'Query for search',
                    type: ArgumentType.STRING,
                    required: true,
                    autocomplete: true
                }
            ]
        })
    }

    async run({ client, respond, args, guild, member, interaction }) {
        if(!member.voice?.channel) return respond({ content: 'Beep boop voice?', ephemeral: true });

        let query = args.getString('query');

        interaction.deferReply();

        if(!isUrl(query)) query = (await search(query, 1))[0].value;
        if(!query) return interaction.editReply({ content: `I didn't find any music. Sorry...`, ephemeral: true });

        const video = await getVideo(query);
        Player.play(client, guild.id, member.voice.channel.id, video);

        interaction.editReply(query);
    }
}

module.exports = Play;