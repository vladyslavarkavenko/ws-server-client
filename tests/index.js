const assert = require('assert');

const wsServer = require('../ws/server');
const wsClient = require('../ws/client');
const {host, port} = require("../config");
describe('Websocket server-client', () => {
    let wss = null;

    beforeEach(() => {
        wss = new wsServer({host, port});
    })
    afterEach(async () => {
        await wss.destroy();
        wss = null;
    })

    it('Subscribe works', async () => {
        const wsc = new wsClient({host, port});

        let subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 0);

        const isSubscribed = await wsc.subscribe();
        assert.equal(isSubscribed, true);

        subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 1);
    });

    it('Subscribe works idempotent', async () => {
        const wsc = new wsClient({host, port});

        let subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 0);

        const isSubscribed1 = await wsc.subscribe();
        assert.equal(isSubscribed1, true);
        const isSubscribed2 = await wsc.subscribe();
        assert.equal(isSubscribed2, true);

        subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 1);
    });

    it('Unsubscribe works', async () => {
        const wsc = new wsClient({host, port});

        let subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 0);

        const isSubscribed = await wsc.subscribe();
        assert.equal(isSubscribed, true);

        subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 1);

        const isUnsubscribed = await wsc.unsubscribe();
        assert.equal(isUnsubscribed, true);

        subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 0);
    });
    it('Unsubscribe works idempotent', async () => {
        const wsc = new wsClient({host, port});

        let subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 0);

        const isSubscribed = await wsc.subscribe();
        assert.equal(isSubscribed, true);

        subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 1);

        const isUnsubscribed1 = await wsc.unsubscribe();
        assert.equal(isUnsubscribed1, true);
        const isUnsubscribed2 = await wsc.unsubscribe();
        assert.equal(isUnsubscribed2, true);

        subscribersCount = await wsc.getSubscribersCount();
        assert.equal(subscribersCount, 0);
    });

    it('CountSubscribers works', async () => {
        const wsc1 = new wsClient({host, port});
        const wsc2 = new wsClient({host, port});

        let subscribersCount = await wsc1.getSubscribersCount();
        assert.equal(subscribersCount, 0);

        const isSubscribed1 = await wsc1.subscribe();
        assert.equal(isSubscribed1, true);

        subscribersCount = await wsc1.getSubscribersCount();
        assert.equal(subscribersCount, 1);

        const isSubscribed2 = await wsc2.subscribe();
        assert.equal(isSubscribed2, true);

        subscribersCount = await wsc2.getSubscribersCount();
        assert.equal(subscribersCount, 2);

        const isUnsubscribed1 = await wsc1.unsubscribe();
        assert.equal(isUnsubscribed1, true);

        subscribersCount = await wsc1.getSubscribersCount();
        assert.equal(subscribersCount, 1);

        const isUnsubscribed2 = await wsc2.unsubscribe();
        assert.equal(isUnsubscribed2, true);

        subscribersCount = await wsc2.getSubscribersCount();
        assert.equal(subscribersCount, 0);
    });
});
