const { default: Collection } = require('@discordjs/collection');
const { GCommandsClient } = require('gcommands');

class MusicClient extends GCommandsClient {
    constructor(options) {
        super(options)

        this.token = options.token;
        this.queue = new Collection();
    }

    run() {
        this.login(this.token);
    }
}

module.exports = MusicClient;