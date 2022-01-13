const { Command, CommandType } = require('gcommands');
const { MessageActionRow, MessageButton } = require('discord.js');

const generateRow = (disabled = null) => {
    const enable = new MessageButton().setLabel('Enable').setStyle('SUCCESS')
.setCustomId(`enableLoop`)
.setDisabled(disabled ?? false);
    const disable = new MessageButton().setLabel('Disable').setStyle('DANGER')
.setCustomId(`disableLoop`)
.setDisabled(disabled ?? false);
    const cancel = new MessageButton().setLabel('Cancel').setStyle('SECONDARY')
.setCustomId(`loopCancel`)
.setDisabled(disabled ?? false);

    const row = new MessageActionRow();
    row.addComponents([enable, disable, cancel]);

    return [row];
}

new Command({
    name: 'loop',
    description: 'Turn on/off loop',
    type: [ CommandType.SLASH ],
    run: async({ client, reply, guild, member, interaction, channel }) => {
        if (!member.voice?.channel) return reply({ content: 'Beep boop voice?', ephemeral: true });

        const queue = client.queue.get(guild.id);
        if (!queue) return reply({ content: 'Beep boop queue?', ephemeral: true });

        const message = await reply({
            content: `• Turn loop on/off.`,
            ephemeral: true,
            components: generateRow(),
            fetchReply: true,
        });

        const filter = i => i?.message?.id === message.id;
        const collector = await channel.awaitMessageComponent({ filter, time: 60000, max: 1 });

        if (!collector) {
            interaction.editReply({
                content: `• Loop is ${queue.loop ? 'on' : 'off'}`,
                components: generateRow(true),
            });

            return;
        }

        collector.deferUpdate();

        if (collector.customId === 'enableLoop') queue.loop = true;
        else if (collector.customId === 'disableLoop') queue.loop = false;

        interaction.editReply({
            content: `• Loop is ${queue.loop ? 'on' : 'off'}`,
            components: generateRow(true),
        });
    }
})