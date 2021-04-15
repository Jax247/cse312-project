class Message{
    constructor(data, contentType, id,likeCount) {
        this.data = data;
        this.contentType = contentType;
        this.id = id;
        this.likeCount = likeCount;
    }

    updateLike(count) {
        let jSend = JSON.parse(this.data.toString());
        jSend['likeCount'] = count;
        this.data = JSON.stringify(jSend);

    }

} module.exports = Message;