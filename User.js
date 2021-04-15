class User{
    constructor(userName, sessionToke, socket, likes) {
        this.username = userName;
        this.sessionToke = sessionToke;
        this.socket = socket;
        this.likes = new Set();
    }

    setSocket(sock) {
        this.socket = sock

    }
} module.exports = User