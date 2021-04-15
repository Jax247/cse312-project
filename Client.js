class Client{
    constructor(clientIp, clientPort,socket) {
        this.clientIp = clientIp;
        this.clientPort = clientPort;
        this.socket = socket;
    }
} module.exports = Client