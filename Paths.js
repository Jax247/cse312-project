class Paths{
    constructor() {
        this.notLoggedInPaths = new Map();
        this.initNotLoggedInPaths();
        this.availPaths = new Map();
        this.initAvailPaths();
        this.redirects = new Map();
        this.initRedirects();
    }
    initNotLoggedInPaths(){
        this.notLoggedInPaths.set("/Authentication/Auth/styles.css", 'content');
        this.notLoggedInPaths.set("/Authentication/Auth/auth.js", 'content');   
    }
    initAvailPaths(){    
        this.availPaths.set('/hello', "content");
        this.availPaths.set('/hi', "redirect");
        this.availPaths.set('/comment', 'redirect');
        this.availPaths.set('/image-upload', 'redirect');
        this.availPaths.set('/utf.txt', 'content')
        this.availPaths.set('/style.css', 'content');
        this.availPaths.set('/function.js', 'content');
        this.availPaths.set('/conversation/dmFunctions.js', 'content');
        this.availPaths.set('/images', 'content');
        this.availPaths.set('/image', 'content');
        this.availPaths.set('/User_Uploads', 'content');
        this.availPaths.set('/websocket', '/websocket');
        this.availPaths.set('/websocketDM', '/websocketDM');
        this.availPaths.set('/register', 'redirect');
        this.availPaths.set('/registerNewAccount', 'redirect');
        this.availPaths.set('/chatScreen', 'content');
        this.availPaths.set('/profile', 'content');
        this.availPaths.set("/Authentication/Auth/styles.css", 'content');
        this.availPaths.set("/Authentication/Registration/styles.css", 'content');
        this.availPaths.set("/Authentication/Auth/auth.js", 'content');
    }
    initRedirects(){
        this.redirects.set('/hi', "/hello");
        this.redirects.set('/comment', '/');
        this.redirects.set('/image-upload', '/');
        this.redirects.set('/register', '/');
        this.redirects.set('/registerNewAccount', '/');
    }
} module.exports = Paths;