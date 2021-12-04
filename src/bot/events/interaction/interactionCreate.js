const { Event } = require('gcommands');
const { search } = require('../../structures/Utils');

class Interaction extends Event {
    constructor(client) {
        super(client, {
            name: 'interactionCreate',
            ws: false,
            once: false,
        });
    }

    async run(client, interaction) {
        if (interaction.isAutocomplete() && interaction.commandName === 'play') {
            const query = interaction.options.getString('query') || 'Never gonna give you up';
            const videos = await search(query, 25);

            interaction.respond(videos);
        }
    }
}

module.exports = Interaction;
