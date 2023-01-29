const MESSAGE_TYPE = {
    Subscribe: "Subscribe",
    Unsubscribe: "Unsubscribe",
    CountSubscribers: "CountSubscribers",
    Error: "Error",
    Heartbeat: "Heartbeat",
}
const MESSAGE_STATUS = {
    Subscribed: "Subscribed",
    Unsubscribed: "Unsubscribed",
}
const MESSAGE_ERROR = {
    NotImplemented: "Requested method not implemented",
    BadFormatted: "Bad formatted payload, non JSON",
}

const getRequestMessage = (type) => {
    const message = JSON.stringify({
        type,
    })
    console.debug("Send message:", message);
    return message;
}
const getResponseMessage = (type, data = {}) => {
    const message = JSON.stringify({
        type,
        ...data,
        updatedAt: new Date().getTime(),
    });
    console.debug("Send message:", message);
    return message;
}

module.exports = {
    MESSAGE_TYPE,
    MESSAGE_STATUS,
    MESSAGE_ERROR,

    getRequestMessage,
    getResponseMessage,
}