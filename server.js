const WsServer = require('./ws/server');
const {host, port} = require("./config");

const server = new WsServer({host, port});

// Handle "ctr" + "c"
process.on('SIGINT', async () => {
    try {
        await server.destroy();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});


module.exports = server;