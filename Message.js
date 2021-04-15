class Message{
    constructor(data, contentType, id,likeCount) {
        this.data = data;
        this.contentType = contentType;
        this.id = id;
        this.likeCount = likeCount;
    }

    updateLike() {
        let jSend = JSON.parse(this.data.toString());
        jSend['likeCount'] = this.likeCount;
        this.data = JSON.stringify(jSend);

    }

} module.exports = Message;