class Message{
    constructor(data, contentType, id, likeCount, ownerId) {

        this.data = data;
        this.contentType = contentType;
        this.id = id;
        this.likeCount = likeCount;
        this.ownerId = ownerId;
    }

    updateLike() {
        let jSend = JSON.parse(this.data.toString());
        jSend['likeCount'] = this.likeCount;
        this.data = JSON.stringify(jSend);

    }

} module.exports = Message;