class Content{
    constructor() {
        this.content = new Map();
        this.initContent();
    }
    initContent(){    
        this.content.set('/hello', ["Hello World!", "text/plain", false, "ascii"]);
        //File destination, content type, boolean of file or not, file type
        this.content.set('/utf.txt', ["./utf.txt", "text/plain; charset=UTF-8; " +
        "\r\nX-Content-Type-Options: nosniff", true, "utf8"])
        this.content.set('/image', ["./image", "image/jpeg \r\nX-Content-Type-Options: nosniff",
            true, "utf8"])
        this.content.set("/style.css", ["./style.css", "text/css; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
        this.content.set("/function.js", ["./function.js", "text/javascript; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
        this.content.set("/Authentication/Auth/auth.js", ["./Authentication/Auth/auth.js", "text/javascript; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);


        this.content.set("/conversation/dmFunctions.js", ["./dmFunctions.js", "text/javascript; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
        this.content.set("/images", ["null", "text/html; \r\nX-Content-Type-Options: nosniff", false, "utf8"])
        this.content.set('/chatScreen', []);
        this.content.set('/profile', 'content');
        this.content.set("/Authentication/Auth/styles.css", ["./Authentication/Auth/styles.css",
            "text/css; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
    }
} module.exports = Content;