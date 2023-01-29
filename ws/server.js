const {WebSocketServer} = require('ws');

const {
    MESSAGE_TYPE,
    MESSAGE_STATUS,
    MESSAGE_ERROR,
    getResponseMessage,
} = require("./messages");
const {sleep} = require("../utils/sleep");

module.exports = class WsServer {
    #wss;

    constructor({host, port}) {
        this.#wss = new WebSocketServer({port});

        this.#wss.on('connection', (ws) => {
            ws.on('message', async (message) => {
                // Parse message
                let parsedMessage;
                try {
                    parsedMessage = JSON.parse(message);
                    console.debug("Received message:", JSON.stringify(parsedMessage));
                } catch (err) {
                    console.debug("Received bad formatted message");
                    ws.send(getResponseMessage(MESSAGE_TYPE.Error, {error: MESSAGE_ERROR.BadFormatted}));
                    return;
                }

                // Process message
                switch (parsedMessage.type) {
                    case MESSAGE_TYPE.Subscribe: {
                        await sleep(4000);
                        ws.subscribed = true;
                        ws.send(getResponseMessage(MESSAGE_TYPE.Subscribe, {status: MESSAGE_STATUS.Subscribed}));
                        break;
                    }
                    case MESSAGE_TYPE.Unsubscribe: {
                        await sleep(8000);
                        ws.subscribed = false;
                        ws.send(getResponseMessage(MESSAGE_TYPE.Unsubscribe, {status: MESSAGE_STATUS.Unsubscribed}));
                        break;
                    }
                    case MESSAGE_TYPE.CountSubscribers: {
                        const count = Array.from(this.#wss.clients).filter(wsc => wsc.subscribed).length;
                        ws.send(getResponseMessage(MESSAGE_TYPE.CountSubscribers, {count}));
                        break;
                    }
                    default: {
                        ws.send(getResponseMessage(MESSAGE_TYPE.Error, {error: MESSAGE_ERROR.NotImplemented}));
                        break;
                    }
                }
            });
        });

        // Heartbeat
        setInterval(() => {
            this.#wss.clients.forEach((wsc) => {
                wsc.send(getResponseMessage(MESSAGE_TYPE.Heartbeat));
            });
        }, 1000);

        console.debug(`Server successfully started on ws://${host}:${port}`);
    }

    async destroy() {
        return new Promise((resolve) => {
            this.#wss.close();
            // Force destroy client connections
            this.#wss.clients.forEach((wsc) => {
                wsc.close();
            });
            this.#wss.on('close', () => resolve())
        })
    }
}