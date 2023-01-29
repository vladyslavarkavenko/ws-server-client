const WsClient = require('./ws/client');
const {host, port} = require("./config");

const client = new WsClient({host, port});

client.subscribe();

// Handle "ctr" + "c"
process.on('SIGINT', async () => {
    try {
        const isUnsubscribed = await client.unsubscribe();
        if (isUnsubscribed) {
            console.log("Successfully unsubscribed!");
        } else {
            console.error("Unsubscribe attempt failed");
        }

        await client.destroy();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});

module.exports = client;