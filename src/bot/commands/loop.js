const { Command } = require("gcommands");
const { MessageActionRow, MessageButton } = require('discord.js')

class Loop extends Command {
    constructor(client) {
        super(client, {
            name: 'loop',
            description: 'Turn on/off loop',
            guildOnly: '747526604116459691'
        })
    }

    generateRow() {
        const enable = new MessageButton().setLabel("Enable").setStyle("SUCCESS").setCustomId(`enableLoop`);
        const disable = new MessageButton().setLabel("Disable").setStyle("DANGER").setCustomId(`disableLoop`);
        const cancel = new MessageButton().setLabel("Cancel").setStyle("SECONDARY").setCustomId(`loopCancel`);

        const row = new MessageActionRow();
        row.addComponents([enable, disable, cancel])

        return [row];
    }

    async run({ client, respond, guild, member, interaction, channel }) {
        if(!member.voice?.channel) return respond({ content: 'Beep boop voice?', ephemeral: true });

        const queue = client.queue.get(guild.id);
        if(!queue) return respond({ content: 'Beep boop queue?', ephemeral: true });

        const message = await respond({
            content: `• Turn loop on/off.`,
            ephemeral: true,
            components: this.generateRow(),
            fetchReply: true
        })

        const filter = (i) => i?.message?.id === message.id;
        const collector = await channel.awaitMessageComponent({ filter, time: 60000, max: 1 });

        if(!collector) {
            interaction.editReply({
                content: `• Loop is ${queue.loop ? 'on' : 'off'}`
            })

            return;
        }

        collector.deferUpdate();

        if(collector.customId === 'enableLoop') queue.loop = true;
        else if(collector.customId === 'disableLoop') queue.loop = false;

        interaction.editReply({
            content: `• Loop is ${queue.loop ? 'on' : 'off'}`
        })
    }
}

module.exports = Loop;