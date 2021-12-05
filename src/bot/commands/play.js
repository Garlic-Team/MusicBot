const { MessageEmbed } = require('discord.js');
const { Command, ArgumentType } = require('gcommands');
const Player = require('../structures/Music/Player');
const { isUrl, search, getVideo } = require('../structures/Utils');

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
                    autocomplete: true,
                },
            ],
        });
    }

    async run({ client, respond, args, guild, member, interaction }) {
        if (!member.voice?.channel) return respond({ content: 'Beep boop voice?', ephemeral: true });

        let query = args.getString('query');

        interaction.deferReply();

        if (!isUrl(query)) query = (await search(query, 1))[0].value;
        if (!query) return interaction.editReply({ content: `I didn't find any music. Sorry...`, ephemeral: true });

        const videos = await getVideo(query);

        for(const video of videos) await Player.play(client, guild.id, member.voice.channel.id, video);

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setAuthor('Music System | Play')
                    .setDescription(`**Requested by**: ${member.user.tag}\n**Requested**: ${videos.length} song(s)\n\n${videos.map((video, i) => { i++; return `\`${i}.\` ${video.title} - ${video.channel.name}` }).slice(0, 10).join('\n')}\nAnd more...`)
                    .setColor("#cf293f")
                    .setFooter(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
            ],
            ephemeral: true
        });
    }
}

module.exports = Play;
