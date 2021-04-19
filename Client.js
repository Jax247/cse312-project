class Client{
    constructor(clientIp, clientPort,expr, socket) {
        this.clientIp = clientIp;
        this.clientPort = clientPort;
        this.sockType = expr;
        this.socket = socket;
        this.userId = "";
    }

    setUserId(id){
        this.userId = id;
    }
} module.exports = Client