const { Command } = require('gcommands');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');

class Queue extends Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            description: 'Check queue',
            guildOnly: '747526604116459691',
        });
    }

    genRow(page, pages, isEmpty, disable) {
        const pageL = new MessageButton().setLabel('Previous Page').setStyle('SECONDARY')
.setCustomId('pageL')
.setDisabled((page === 0) || disable);
        const pageR = new MessageButton().setLabel('Next Page').setStyle('SECONDARY')
.setCustomId('pageR')
.setDisabled((page === pages.length - 1) || disable);
        const skip = new MessageButton().setLabel('Skip').setStyle('SECONDARY')
.setCustomId('skip')
.setDisabled((isEmpty) || disable);
        const cancel = new MessageButton().setLabel('Cancel').setStyle('DANGER')
.setCustomId('cancel')
.setDisabled(disable);

        const buttonRow = new MessageActionRow();
        buttonRow.addComponents([pageL, pageR, skip, cancel]);

        return [buttonRow];
    }

    async run({ respond, client, guild, channel, interaction }) {
        const queue = client.queue.get(guild.id);
        if (!queue) return respond({ content: 'Beep boop queue?', ephemeral: true });

        const arrows = ['⬐','⬑'];
        const dots = '…';

        let pages = [];
        let format = [];
        let page = 0;

        const fill = () => {
            pages = [];
            format = [];

            for (let i = 0; i < queue.songs.length; i++) {
                const song = queue.songs[i];

                let prefix = ``;
                let suffix = ``;

                if (i === 0) {
                  const startOffset = ' '.repeat(2 + (i + 1).toString().length);
                  prefix = `${startOffset}${arrows[0]} Currently Playing\n`;
                  suffix = `\n${startOffset}${arrows[1]} Currently Playing`;
                }

                format.push(`${prefix}${i + 1}) ${song.title.length > 53 ? `${song.title.slice(0, 53)}${dots}` : song.title}${suffix}`);
            }

            const isEmpty = format.length < 1;
            if (format.length < 1) format.push('Any songs!');

            const max = 10;
            for (let i = 0; i <= format.length; i += max) {
                pages.push(format.slice(i, i + max));
            }

            return isEmpty;
        };

        let isEmpty = fill();

        const message = await respond({
            embeds: [
                new MessageEmbed()
                    .setAuthor('Music System | Queue')
                    .setTitle(`Page ${page}`)
                    .setDescription(`\`\`\`nim\n${pages[page].join('\n')}\`\`\``)
                    .setColor('#cf293f'),
            ],
            components: this.genRow(page, pages, isEmpty, false),
            ephemeral: true,
            fetchReply: true,
        });

        const filter = i => i?.message?.id === message.id;
        const collector = channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('end', () => {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor('Music System | Queue')
                        .setTitle(`Page ${page}`)
                        .setDescription(`\`\`\`nim\n${pages[page].join('\n')}\`\`\``)
                        .setColor('#cf293f'),
                ],
                components: this.genRow(page, pages, isEmpty, true),
                ephemeral: true,
            });
        });

        collector.on('collect', collected => {
            collected.deferUpdate();

            if (collected.customId === 'pageL' && page > 0) page--;
            if (collected.customId === 'pageR' && page < pages.length) page++;
            if (collected.customId === 'skip' && queue.connection) queue.connection.state.subscription.player.stop();

            if (collected.customId === 'cancel') {
                interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor('Music System | Queue')
                            .setTitle(`Page ${page}`)
                            .setDescription(`\`\`\`nim\n${pages[page].join('\n')}\`\`\``)
                            .setColor('#cf293f'),
                    ],
                    components: this.genRow(page, pages, isEmpty, true),
                    ephemeral: true,
                });

                return;
            }

            isEmpty = fill();

            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor('Music System | Queue')
                        .setTitle(`Page ${page}`)
                        .setDescription(`\`\`\`nim\n${pages[page].join('\n')}\`\`\``)
                        .setColor('#cf293f'),
                ],
                components: this.genRow(page, pages, isEmpty, false),
                ephemeral: true,
            });
        });
    }
}

module.exports = Queue;
