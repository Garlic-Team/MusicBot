const { Listener } = require('gcommands');

new class Debug extends Listener {
    constructor() {
        super({
            name: 'debug',
            event: 'debug'
        });
    }

    run(debug) {
        console.log(debug);
    }
}