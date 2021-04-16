class User{
    constructor(userName, sessionToke, socket, likes) {
        this.username = userName;
        this.sessionToken = sessionToke;
        this.socket = socket;
        this.location = "";
        this.likes = new Set();
        this.chats = new Map();
        this.posts = [];
    }

    //add new person to who you chat with
    // Value of this usernameId is the array of messages to eachother
    addChat(username) {
        this.chats.set(username, []);
    }

    addMessageToChat(chatWith, message) {
        this.chats.get(chatWith).push(message);
    }

    setSocket(sock) {
        this.socket = sock
    }



} module.exports = User