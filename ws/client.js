const WebSocketClient = require('ws');

const {
    MESSAGE_TYPE,
    MESSAGE_STATUS,
    getRequestMessage
} = require("./messages");

module.exports = class WsClient {
    #wsc;
    #wsIsOpenPromise;

    constructor({host, port}) {
        const url = `ws://${host}:${port}`;

        this.#wsc = new WebSocketClient(url);
        this.#wsIsOpenPromise = new Promise((resolve) => {
            this.#wsc.on('open', () => {
                console.debug(`Client successfully connected to ${url}`);
                resolve();
            })
        })

        // Debug purposes only
        this.#wsc.on('message', (message) => {
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
                console.debug("Received message:", JSON.stringify(parsedMessage));
            } catch (err) {
                console.debug("Received bad formatted message");
            }
        })
    }

    async #wscRequest(messageType) {
        await this.#wsIsOpenPromise;

        this.#wsc.send(getRequestMessage(messageType));

        return new Promise((resolve, reject) => {
            this.#wsc.on('message', (message) => {
                let parsedMessage;
                try {
                    parsedMessage = JSON.parse(message);
                } catch (err) {
                    return reject(err);
                }

                // FIXME: Error message design is bad, we have no way to identify exactly which client message caused an error on server
                if (parsedMessage.type === MESSAGE_TYPE.Error) {
                    return reject(parsedMessage.error);
                } else if (parsedMessage.type === messageType) {
                    return resolve(parsedMessage);
                }
            });
        })
    }

    async subscribe() {
        const res = await this.#wscRequest(MESSAGE_TYPE.Subscribe);
        return res.status === MESSAGE_STATUS.Subscribed;
    }

    async unsubscribe() {
        const res = await this.#wscRequest(MESSAGE_TYPE.Unsubscribe);
        return res.status === MESSAGE_STATUS.Unsubscribed;
    }

    async getSubscribersCount() {
        const res = await this.#wscRequest(MESSAGE_TYPE.CountSubscribers);
        return res.count;
    }

    async destroy() {
        if (this.#wsc) {
            this.#wsc.terminate();
        }
    }
}