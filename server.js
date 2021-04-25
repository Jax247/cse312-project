const net = require('net');
const fs = require('fs');
const FormSection = require('./FormSection');
const Upload = require('./Upload');
const crypto = require('crypto')
const Client = require('./Client');
const Message = require('./Message');
const User = require('./User');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


let notLoggedInPaths = new Map();
notLoggedInPaths.set("/Authentication/Auth/styles.css", 'content');
notLoggedInPaths.set("/Authentication/Auth/auth.js", 'content');


let availPaths = new Map();
availPaths.set('/hello', "content");
availPaths.set('/hi', "redirect");
availPaths.set('/comment', 'redirect');
availPaths.set('/image-upload', 'redirect');
availPaths.set('/utf.txt', 'content')
availPaths.set('/style.css', 'content');
availPaths.set('/function.js', 'content');
availPaths.set('/profile/function.js', 'content');
availPaths.set('/conversation/dmFunctions.js', 'content');
availPaths.set('/images', 'content');
availPaths.set('/image', 'content');
availPaths.set('/User_Uploads', 'content');
availPaths.set('/websocket', '/websocket');
availPaths.set('/websocketDM', '/websocketDM');
availPaths.set('/register', 'redirect');
availPaths.set('/registerNewAccount', 'redirect');
availPaths.set('/chatScreen', 'content');
availPaths.set('/profile', 'content');
availPaths.set("/Authentication/Auth/styles.css", 'content');
availPaths.set("/Authentication/Registration/styles.css", 'content');
availPaths.set("/Authentication/Auth/auth.js", 'content');



let content = new Map();
content.set('/hello', ["Hello World!", "text/plain", false, "ascii"]);
//File destination, content type, boolean of file or not, file type
content.set('/utf.txt', ["./utf.txt", "text/plain; charset=UTF-8; " +
"\r\nX-Content-Type-Options: nosniff", true, "utf8"])
content.set('/image', ["./image", "image/jpeg \r\nX-Content-Type-Options: nosniff",
    true, "utf8"])
content.set("/style.css", ["./style.css", "text/css; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
content.set("/function.js", ["./function.js", "text/javascript; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
content.set("/profile/function.js", ["./function.js", "text/javascript; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
content.set("/Authentication/Auth/auth.js", ["./Authentication/Auth/auth.js", "text/javascript; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);


content.set("/conversation/dmFunctions.js", ["./dmFunctions.js", "text/javascript; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);
content.set("/images", ["null", "text/html; \r\nX-Content-Type-Options: nosniff", false, "utf8"])
content.set('/chatScreen', []);
content.set('/profile', 'content');
content.set("/Authentication/Auth/styles.css", ["./Authentication/Auth/styles.css",
    "text/css; \r\nX-Content-Type-Options: nosniff", true, "utf8"]);



let redirects = new Map();
redirects.set('/hi', "/hello");
redirects.set('/comment', '/');
redirects.set('/image-upload', '/');
redirects.set('/register', '/');
redirects.set('/registerNewAccount', '/');


let namesAndComments = [];
let userUploads = [];

let upgradedUsers = new Map();
let messageHistory = [];
//All users ever
let allUsers = new Map();
//All active users
let tokenUsers = new Map();



var url = "mongodb://localhost:27017/";
//var url = 'mongodb://mongo:27017';

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");

    db.close();
});
//TODO: CHANGE HOW WE IMPORT A MESSAGE BY GETTING LIKES
importFromMongo()



fs.readdirSync('./User_Uploads').forEach(upload => {
    fs.unlinkSync('./User_Uploads/' + upload);
});

net.createServer(function (socket) {


    //console.log("SERVER STARTED");
    //console.log(messageHistory);
    //console.log(allUsers);

    //if the client is logged in do the usual


    let waitingForContent = false;
    let extendedBuffer;
    let lines;
    let tempHeaders;
    let contentLength;

    socket.on('end', function (list) {

        //console.log("SOCKET end");
    });
    socket.on("error", function (list) {
        //console.log("SOCKET ERROR");
    });

    socket.on('close', function (list) {
        //Go thru tokenList and delete pair with matching Socket
        if (socket.remoteAddress) {
            //console.log("USER LEFT:");
            //console.log(socket.remoteAddress);
            //console.log(socket.remotePort);
            upgradedUsers.delete(socket.remoteAddress + socket.remotePort.toString());
            sendActiveUsers();
        } else {
            //console.log("SOCKET UNDEFINED");
        }
        //
        // for (let [key, value] of tokenUsers) {
        //     if (value.socket === socket) {
        //         //console.log("MATCHING SOCKET");
        //         tokenUsers.delete(key);
        //     }
        //     ////console.log("WE ARE IN LOOP");
        //     ////console.log(value.socket.remoteAddress);
        //     ////console.log(value.socket.remotePort);
        // }
        //console.log("SOECKT CLOSE");
    });


    socket.on("data", function (data) {
        //console.log("ACTIVE USERS: " + upgradedUsers.size)
        ////console.log("CLIENT PORT: " + socket.remotePort);
        ////console.log("NEW STUFF");
        ////console.log(data.toString());
        ////console.log("WAITING FOR CONTENT: ", waitingForContent);
        if (!waitingForContent) {
            //lines = data.toString().split("\r\n");
            var indexOfContent = data.indexOf('\r\n\r\n');
            tempHeaders = data.subarray(0, indexOfContent);
            lines = tempHeaders.toString().split('\r\n');
            contentLength = parseInt(getHeaderInfo("Content-Length:", lines));
            extendedBuffer = data.subarray(indexOfContent, data.length);
            if (extendedBuffer.length < contentLength) {
                waitingForContent = true;
            }
        } else {
            extendedBuffer = Buffer.concat([extendedBuffer, data]);
            if (contentLength <= extendedBuffer.length) {
                waitingForContent = false;
            }
        }

        if (!waitingForContent) {
            if (upgradedUsers.has(socket.remoteAddress + socket.remotePort.toString())) {
                ////console.log(data.toString());
                ////console.log("CONSOLE IS UPGRADED: " + data.length);
                handleAsWebsocket(socket, data);
            } else {
                const requestParts = lines[0].split(" ");
                const requestType = requestParts[0];
                const requestPath = requestParts[1];
                const HTTPVer = requestParts[2];

                const port = lines[1].split(':')[2];

                if (checkForToken(lines)) {
                    ////console.log("FOUND COOKIE");
                    ////console.log(lines)
                    ////console.log("REGULAR CLIENT");


                    if (requestType === "GET") {
                        paths(requestPath, socket, port, lines);
                    }
                    if (requestType === "POST") {
                        extendedBuffer = Buffer.concat([tempHeaders, extendedBuffer]);
                        postRequest(extendedBuffer, lines, requestPath, socket, port);
                    }
                    extendedBuffer = [];
                    tempHeaders = [];
                } else {
                    ////console.log(lines);
                    ////console.log("SHOULD BE HERE");
                    console.log(requestPath)
                    notLoggedInHandler(requestPath, socket, port, lines, extendedBuffer);
                    //socket.write(buildHtmlResponse('./login.html', []));
                }
            }
        }
    });

}).listen({host: "0.0.0.0", port: 8000});





//function paths(check, socket, port, lines) {
function notLoggedInHandler(path, socket, port, lines, data) {
    console.log("NOT LOGGED IN");
    console.log(path);
    let tempPath;
    if (notLoggedInPaths.has(path) || path.startsWith('/image')) {
        tempPath = path;
        path = 'other';
    }

    let response;
    switch (path) {
        case '/registerNewAccount':
            var formAsList = handleMultiPart(data, lines);
            var userFound = usernameExists(formAsList[0].content.toString());
            ////console.log("USERFOUND: " + userFound);
            if (!userFound) {
                ////console.log("CREATING ACCOUNT");
                //loggedInUsers.set(socket.remoteAddress.toString() + socket.remotePort.toString(), "GARBAGE");
                ////console.log("USERNAME DOESNT EXIST");
                //temporary
                let userName = formAsList[0].content.toString();
                let password = formAsList[1].content.toString();
                //Still need to add check of user and password leng for now good
                //TODO:
                let currUser = sendCookie(userName, socket);
                createUserInDB(formAsList[0].content.toString(), formAsList[1].content.toString(), currUser);
                //Send cookie which adds their session token
                response = buildHtmlResponse('./Authentication/Registration/Register.html', []);

            }
            break
        case '/register?':
            console.log("SENDING REGISTER");
            response = buildHtmlResponse('./Authentication/Registration/Register.html', []);
            break;

        case 'other':
            paths(tempPath, socket, port, lines);
            console.log("IS OTHER");
            return;
        default:
            response = buildHtmlResponse('./Authentication/Login/login.html', []);
    }
    if (response) {
        socket.write(response);

    }
}

function sendCookie(username, socket) {

    //Create Random Cookie
    let token = Math.random().toString(36).substr(3, 8) +
        Math.random().toString(36).substr(2, 20) +
        Math.random().toString(36).substr(3, 9);

    //needs to be beefed up or could work?
    if (allUsers.has(username)) {
        tokenUsers.set(token, allUsers.get(username));
        //console.log("RETURNING USER");
    } else {
        //console.log("NEW USERS");
        let newUser = new User(username, token, socket, []);
        allUsers.set(username, newUser)
        tokenUsers.set(token, newUser);

    }

    let content = fs.readFileSync('./index.html');
    let cookie = "HTTP/1.1 301 OK\r\n" +
        "Location: http://localhost:" + socket.localPort + "\r\n" +
        "Set-Cookie: sessionToken=" + token + "\r\n\r\n";

    socket.write(cookie);

    return allUsers.get(username);

}

function sendActiveUsers() {
    let users = [];
    upgradedUsers.forEach((values,keys)=>{
        users.push(values.userId)
    })
    let sendMsg = JSON.stringify({activeUsers: upgradedUsers.size, userId:users})

    for (let [ipPort, user] of upgradedUsers){
        ////console.log("SENDING", sendMsg);
        user.socket.write(createWebsocketFrame(new Message(sendMsg, 'text')));

    }
}


function checkForToken(lines) {
    //console.log("CHECKING FOR COOKEI");
    let cookies = getHeaderInfo('Cookie:', lines);
    ////console.log(getValueFromHeader('sessionToken=', cookies));
    return tokenUsers.has(getValueFromHeader('sessionToken=', cookies));
}

function usernameExists(username) {
    let doesExist = false;
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        //console.log("CHECKING FOR USER");

        var query = {username: username}
        dbo.collection('users').find(query).toArray(function (err, doc) //find if a value exists
        {
            ////console.log(doc);
            ////console.log(doc.length);

            if (doc.length > 0) {

                //console.log("DOES INCLUED : " + username);

                doesExist = true;


            }
            db.close();

        });
    });
    ////console.log("RETVAL : " + doesExist);
    return doesExist;
}

//TODO: CREATE USER IN DB need to salt
function createUserInDB(username, password, user) {
    ////console.log("USER: " + user.chats);
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");

        var user = {username: username, password: password, chats : "", posts: ""};
        dbo.collection("users").insertOne(user, function (err, res) {
            if (err) throw err;
            ////console.log("1 document inserted");
            db.close();
        });
    });

}


function createWebsocketFrame(message) {
    let type = message.contentType
    let messageData = message.data;

    let finOpp = 129;

    if (type === 'image') {
        finOpp = 130;
    }
    let payloadLeng = messageData.length;
    ////console.log("DECODED LENG: " + messageData.length);

    let send = new Buffer(Buffer.from([finOpp]));
    if (payloadLeng >= 126 && payloadLeng < 65536) {
        ////console.log("SHOULD CHANGE FRAME");
        send = new Buffer.concat([send, Buffer.from([126])]);
        let byte1 = 0xff & (payloadLeng >> 8);
        let byte2 = 0xff & payloadLeng;
        ////console.log("BUILD LENG: " + byte1.toString(2) + "_" + byte2.toString(2));
        send = new Buffer.concat([send, Buffer.from([byte1, byte2])]);

    } else {
        ////console.log("SMALL MESSAGE");
        send = new Buffer.concat([send, Buffer.from([payloadLeng])]);
    }
    ////console.log("OUT OF IF");
    ////console.log(Buffer.from(messageData, 'binary'));
    send = Buffer.concat([send, Buffer.from(messageData, 'binary')]);
    //console.log("SEND: " + message.data.toString());
    ////console.log("SEND LENG: " + send.length);
    return send;

}

function handleAsWebsocket(socket, data) {
    //console.log("HANDLING SOCKET");
    var opp = (data[0]) & 15;
    var maskBit = (data[1] & 128);
    var maskIdx = 0;
    var senderSocket = socket;
    ////console.log("FINBIT: " + (data[0] & 256));
    ////console.log(data.length);

    var leng = (data[1] & 127);
    let extendedLeng;
    let isImage = false;
    if ((opp !== 1 || opp !== 2) && data.length > 10) {

        if (opp !== 1) {
            isImage = true;
        }

        if (leng === 126) {
            extendedLeng = ((data[2]) + (data[3])) & 0xffff;
            ////console.log("EXTEND: " + data[2].toString(2) + "_" + data[3].toString(2));
            let add1 = Buffer.from([data[2]]);
            let add2 = Buffer.from([data[3]]);

            var temp = Buffer.concat([add1, add2]);
            ////console.log("TEMP: : " + temp.readInt16LE(0).toString(16));
            //leng = parseInt(extendedLeng);
            ////console.log("LENG: " + leng);
            ////console.log("LENG: " + parseInt(extendedLeng));
            maskIdx += 2;
        } else if (leng === 127) {
            ////console.log("WE GOETTEM ");
        }

        ////console.log("MASK BIT: " + maskBit);
        var MASK = [data[2 + maskIdx], data[maskIdx + 3], data[maskIdx + 4], data[maskIdx + 5]];

        var DECODED = "";
        for (let i = 6 + maskIdx; i < data.length; i++) {
            DECODED += String.fromCharCode(MASK[(i - 6 - maskIdx) % 4] ^ data[i]);
        }
        ////console.log(DECODED.length);
        let sendFrame;
        let frameType;
        let message;
        if (!isImage) {

            DECODED = DECODED
                .replace(/&/g, '&amp;')
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            let jTemp = JSON.parse(DECODED);
            let currUserToken;
            if (jTemp.like === 'sent') {

                frameType = 'like';
                var pOut = handleLike(jTemp);
                //console.log(pOut);
                DECODED = pOut
            } else if (tokenUsers.has(jTemp['sessionToken'])) {
                frameType = 'post';

                currUserToken = jTemp['sessionToken'];


                //DECODED = DECODED.substr(0, DECODED.length - 1);
                var idNum = messageHistory.length;

                jTemp["id"] = idNum;
                jTemp["likeCount"] = 0;
                jTemp["userID"] = tokenUsers.get(currUserToken).username
                delete jTemp['sessionToken'];

                DECODED = jTemp;
                //console.log(DECODED);
                //likeOrDisLike()

                //handle Direct message seperate
            }else if (jTemp.dm === true) {
                frameType = 'dm';


                //TODO:
                if (tokenUsers.has(jTemp.dmnotify)) {

                    tokenUsers.get(jTemp.dmnotify).setSocket(socket);
                    upgradedUsers.get(socket.remoteAddress + socket.remotePort.toString()).sockType = '/websocketDM/' + jTemp.userRecvid;

                    upgradedUsers.get(socket.remoteAddress + socket.remotePort.toString())
                        .setUserId(tokenUsers.get(jTemp.dmnotify).username.toString());


                    sendActiveUsers();
                    let currUser = tokenUsers.get(jTemp.dmnotify).username
                    //allUsers.get(currUser).socket = socket;

                    allUsers.get(currUser).location = 'websocketDM/'+jTemp.userRecvid ;
                    allUsers.get(currUser).socket = socket;

                    //("USER TO RECV: " + jTemp.userRecvid);
                    if (allUsers.get(currUser).chats.has(jTemp.userRecvid)) {
                        ////console.log("SHOULD SEND MESSAGE");
                        let messages = allUsers.get(currUser).chats.get(jTemp.userRecvid);
                        messages.forEach(message =>
                            socket.write(createWebsocketFrame(new Message(message, frameType))));
                        return;
                    }
                    return;

                } else {
                    handleDirectMessage(jTemp);
                    //("HANDLING dms");
                    return;
                }




            } else if (tokenUsers.has(jTemp.notify)) {
                //console.log("UPDATING USERS");

                currUserToken = jTemp['notify'];

                //TODO: Add to JSON object then keep this list up to date on client side
                tokenUsers.get(jTemp.notify).setSocket(socket);
                //upgradedUsers.get(socket.remoteAddress + socket.remotePort.toString()).sockType = '/websocket';
                upgradedUsers.get(socket.remoteAddress + socket.remotePort.toString())
                    .setUserId(tokenUsers.get(jTemp.notify).username.toString());


                sendActiveUsers();

                ////console.log(upgradedUsers)


                allUsers.get(tokenUsers.get(currUserToken).username).location = 'index';
                allUsers.get(tokenUsers.get(currUserToken).username).socket = socket;

                let tempLikes = JSON.stringify(Array.from(tokenUsers.get(currUserToken).likes.keys()));
                ////console.log(tempLikes)

                socket.write(createWebsocketFrame(new Message(tempLikes, frameType)));

                //console.log("UDATED");
                return;

            } else {
                return;
            }

        } else {
            frameType = 'image';


            //socket.write(createWebsocketFrame(DECODED, 'image'));
        }

        //console.log("DECODED");
        //////console.log(DECODED);



        message = new Message(JSON.stringify(DECODED), frameType, messageHistory.length, 0);
        sendFrame = createWebsocketFrame(message);


        if (frameType === 'like') {

        } else if (frameType === 'post') {

            message.ownerId = DECODED.userID
            allUsers.get(message.ownerId).addPosts(message.id);
            //TODO: WRITE POST TO DB USER
            messageHistory.push(message);
            ////console.log("MESSAGE: " + message.data);
            storePost(message, message.ownerId);



        }

        ////console.log("SENDING");


        for (let [key, value] of upgradedUsers) {
            ////console.log("WE ARE IN LOOP");
            ////console.log(value.socket.remoteAddress);
            ////console.log(value.socket.remotePort);
            value.socket.write(sendFrame);
        }


        //Image incoming

    }

}


//TODO: CHECK IF THEY HAVE EXISTING CONVERSATION
//TODO: SAVE MESSAGES TO THEIR CHAT
function handleDirectMessage(jObject) {
    //console.log("HANDLING")
    //console.log(allUsers);

    let tokenUser = tokenUsers.get(jObject.senderToken);
    if (tokenUsers.has(jObject.senderToken)) {

        let senderName = tokenUsers.get(jObject.senderToken).username;
        let recvName = jObject.userRecvid;
        let sendUser = allUsers.get(senderName);
        let recvUser = allUsers.get(recvName);

        if (!sendUser.chats.has(recvName)) {
            //Add the message to current Map

            //TODO: Uncomment recv Stuff
            sendUser.addChat(recvName);
            //console.log("RECV: " , recvUser)
            //console.log("SENDUSER: ", sendUser);
            recvUser.addChat(senderName);
        }


        let messageToSave = JSON.stringify({'sender': senderName, 'messageContent': jObject.message});

        sendUser.addMessageToChat(recvName, messageToSave);

        // if (upgradedUsers.get()) {
        //
        // }


        recvUser.addMessageToChat(senderName, messageToSave);


        allUsers.set(recvName, recvUser);
        allUsers.set(senderName, sendUser);

        addDirectMessageToMongo(sendUser, recvUser, messageToSave);

        //user Is on

        if (tokenUsers.has(recvUser.sessionToken)) {
            //console.log("USER IS HERE");
            if (recvUser.location === 'websocketDM/' + senderName) {
                //console.log("USER AT DM");
                recvUser.socket.write(createWebsocketFrame(new Message(messageToSave, 'text')));
            //else if (recvUser.location === 'index')
            } else {
                //console.log("USER AT INDEX");
                recvUser.socket.write(createWebsocketFrame(new Message(JSON.stringify({hasMessage: senderName}), 'text')));

            }
        } else {
            //console.log("USER OFFLINE");
        }



        tokenUsers.get(jObject.senderToken).socket.write(createWebsocketFrame(new Message(messageToSave, 'text')));
        ////console.log(sendUser);
        //console.log("USER:")

        ////console.log(allUsers.get(recvName).chats);

    }

}


function addDirectMessageToMongo(sendUser, recvUser, message) {


    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");


        var sendUserQuery = {username: sendUser.username};
        //console.log("CHATS: " + JSON.stringify([...sendUser.chats]));

        let postReplace = {$set: {chats :JSON.stringify([...sendUser.chats])}};


        var recvUserQuery = {username: recvUser.username};
        var recvMessages = {$set: {chats :JSON.stringify([...recvUser.chats])}};
        // let tempSet = allUsers.get(username).likes;
        // let newValues = {$set: {likes: JSON.stringify([...tempSet.keys()])}};


        dbo.collection("users").updateOne(sendUserQuery, postReplace, function (err, res) {
            if (err) throw err;
            //console.log("1 document updated");
            //db.close();
        });



        dbo.collection("users").updateOne(recvUserQuery, recvMessages, function (err, res) {
            if (err) throw err;
            //console.log("1 document updated");
            //db.close();
        });
    });
}


//TODO: go to user collection get user with username update their list of likes
//TODO: ALSO UPDATE LIKE COUNT OF POST USING POST ID:
function addLikeToMongo(username, postId, doesLike) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var userQuery = {username: username };
        let postQuery = {id: postId}


        let postReplace = {$set: {likeCount: messageHistory[parseInt(postId)].likeCount}};


        let tempSet = allUsers.get(username).likes;
        let newValues = { $set: {likes: JSON.stringify([...tempSet.keys()]) } };



        dbo.collection("users").updateOne(userQuery, newValues, function(err, res) {
            if (err) throw err;
            //console.log("1 document updated");
            //db.close();
        });

        dbo.collection("message").updateOne(postQuery, postReplace, function(err, res) {
            if (err) throw err;
            //console.log("1 document updated");
            db.close();
        });




    });

}

function handleLike(like) {
    //console.log(like);
    let totalLikes = 0;
    let doesLike = false;
    let user;


    if (tokenUsers.has(like.sessionToken)) {
        user = tokenUsers.get(like.sessionToken);
        if (tokenUsers.get(like.sessionToken).likes.has(like.messageId)) {
            tokenUsers.get(like.sessionToken).likes.delete(like.messageId);
            //console.log(messageHistory[parseInt(like.messageId)])
            messageHistory[parseInt(like.messageId)].likeCount -= 1;
        } else {
            tokenUsers.get(like.sessionToken).likes.add(like.messageId);
            messageHistory[parseInt(like.messageId)].likeCount += 1;
            doesLike = true;
        }

        //TODO: check if works
        addLikeToMongo(tokenUsers.get(like.sessionToken).username, like.messageId, doesLike);

        messageHistory[parseInt(like.messageId)].updateLike();
        totalLikes = messageHistory[parseInt(like.messageId)].likeCount;
        like["totalLike"] = totalLikes;
        like["doesLike"] = doesLike;
        let tempToken = like['sessionToken'];
        delete like['sessionToken'];

        //console.log("GOING TO SEND: " + JSON.stringify(like));
        tokenUsers.get(tempToken).socket.write(createWebsocketFrame(new Message(JSON.stringify(like))))


        delete like['doesLike'];
        //console.log(like);
        //console.log("GETTING LIKE");
        //console.log(messageHistory);
    }
    return like;
}

function importFromMongo() {
     MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        //console.log("GETTING COLLECTIOn");

        var col = dbo.collection('message').find();

        //Import Messages
         col.each( function (err, document) {
            if (document) {
                let jsonMessage = JSON.stringify(
                    {
                        username: document.username,
                        comment: document.comment,
                        id: document.id,
                        likeCount: document.likeCount,
                        userID: document.userID
                    });
                messageHistory.push(new Message(jsonMessage, document.contentType, messageHistory.length, document.likeCount));
            }
        });

        //console.log("MESSAGES")


        //console.log(messageHistory);

        var users = dbo.collection('users').find();
        users.each(function (err, document) {
            if (document) {
                let newUser = new User(document.username, "", "", document.likes);
                if (document.chats !== "" && document.chats) {
                    //console.log("SETTING");
                    console.log((document.chats));
                    newUser.setChats(jsonToMap(JSON.parse(document.chats)));
                }
                if (document.posts !== "" && document.posts) {
                    newUser.posts = JSON.parse(document.posts);
                }

                allUsers.set(document.username, newUser);
            }
        });
        //console.log("ALL USERS");
        //console.log(allUsers);
        //TODO: IMPORT users into allUsers and populate each user field

        // var user = dbo.collection('users').find();
        // user.each(function (err, document) {
        //     if (document) {
        //         allUsers.push(new User(document.username, document.contentType, messageHistory.length, 0));
        //     }
        // });
        dbo.close
    });

}

function jsonToMap(tooDarr)  {

    let resMap = new Map();

    for (let arr in tooDarr) {
        resMap.set(arr[0], arr[1]);
    }

    return resMap;
}

function storePost(message, ownerId) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        let tempJson = JSON.parse(message.data);
        var myobj =
            {   username: tempJson.username,
                comment: tempJson.comment,
                contentType: message.contentType,
                id:tempJson.id,
                likeCount: tempJson.likeCount,
                userID: tempJson.userID
            };

        dbo.collection("message").insertOne(myobj, function (err, res) {
            if (err) throw err;
            //console.log("1 document inserted");
            //db.close;
        });

        var userQuery = {username: ownerId };
        let postReplace = {$set: {posts: JSON.stringify(allUsers.get(ownerId).posts)}};


        dbo.collection("users").updateOne(userQuery, postReplace, function(err, res) {
            if (err) throw err;
            //console.log("1 document updated");
            db.close();
        });
    });

}

function getHeaderInfo(desiredLine, lines) {
    let retVal = "-1";
    lines.forEach(line => {
        if (line.startsWith(desiredLine)) {
            retVal = line.substr(line.indexOf(":",) + 1, line.length).trim();
            return retVal;
        }
    });
    return retVal;
}

function getValueFromHeader(desired, line) {
    let value = "";
    let indexOfDesired = line.indexOf(desired) + desired.length;
    let end = desired.indexOf(';', indexOfDesired);
    if (end < line.length && end > -1) {


        end = desired.indexOf(';', indexOfDesired);
    } else {
        end = line.length - 1;
    }
    ////console.log("START", indexOfDesired);
    ////console.log("END:", end);

    return line.substr(indexOfDesired, end);
}

function parseFormBoundary(content, boundary) {

    var encodedBound = boundary;
    var formSections = [];
    var indexOfLastBound = content.indexOf(encodedBound);
    var pointer = content.indexOf(encodedBound);
    var contentDisp;
    var contentType;
    var contentBody;
    let contentPointer;

    while (pointer !== -1) {
        pointer += encodedBound.length + 2;
        contentPointer = content.indexOf('\r\n\r\n', pointer) + 4;

        contentDisp = content.subarray(pointer, content.indexOf('\r\n', pointer));
        pointer += contentDisp.length + 2;

        contentType = content.subarray(pointer, content.indexOf('\r\n', pointer));
        pointer += contentType.length;

        contentBody = content.subarray(contentPointer, content.indexOf(encodedBound, pointer) - 2);

        pointer = content.indexOf(encodedBound + '\r\n', pointer);
        formSections.push(new FormSection(contentDisp.toString(), contentType.toString(), contentBody));
        if (pointer < 0) {
            return formSections;
        }
    }
    return formSections;
}

function handleMultiPart(data, lines) {
    const encodedNewLine = Buffer.from('\r\n\r\n', 'utf8');
    const indexOfContentStart = data.indexOf(encodedNewLine);
    const encodedBody = data.subarray(indexOfContentStart + 2, data.length);
    var contentLength = parseInt(getHeaderInfo("Content-Length:", lines));
    var contentType = getHeaderInfo("Content-Type:", lines);


    let typeInfo;
    let boundary;
    let formAsList = [];
    ////console.log("BEFORE CHECK: ", contentType);
    if (contentType.includes('multipart/form-data')) {
        //("PARSING ");
        typeInfo = contentType.split(";");
        boundary = "--";
        boundary += typeInfo[1].substring(10, typeInfo[1].length);
        formAsList = parseFormBoundary(encodedBody, boundary);
    }
    return formAsList;
}

function postRequest(data, lines, requestPath, socket, port) {

    ////console.log("LINES: ", lines);
    ////console.log("END OF LINES");

    let response;
    let userId;
    if (requestPath.includes('/conversation')) {
        requestPath = '/conversation'
        userId = requestPath.substr(requestPath.length);
    }


    let formAsList = handleMultiPart(data, lines);
    switch (requestPath) {
        case "/image-upload":

            let fileName = "fileName=";
            //Only allows for jpeg upload
            if (formAsList.length > 0 && formAsList[0] && formAsList[1] &&
                (formAsList[0].contentType.toString().includes('image/jpg') || formAsList[0].contentType.toString().includes('image/jpeg'))) {


                ////console.log("REACHED IMAGE UPLOAD:  ", formAsList[1].contentType);


                let nameOfImage = formAsList[0].contentDisposition.substr(formAsList[0].contentDisposition.indexOf("filename=") + fileName.length).replace(/"/g, "");
                let contentType = formAsList[0].contentType;
                ////console.log("PRINTING CONTENT:  ", formAsList[0].contentType);
                fs.writeFile('./User_Uploads/' + nameOfImage, formAsList[0].content, function (error) {
                    if (error) return //console.log(error);
                });

                let newUpload = new Upload('./User_Uploads/' + nameOfImage, formAsList[1].content.toString()
                    .replace(/&/g, '&amp;')
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;"), contentType);


                userUploads.push(newUpload);

                //if(userUploads.includes())


                ////console.log("ADDED ANOTHER IMAGE :  SIZE: ", userUploads.length);
            }
            response = buildRedirect(redirects.get('/image-upload'), port);
            break;
        case "/comment":
            //10 = length of boundary=
            // Trim string and change <,>,& for protection
            let name = formAsList[0].content.toString();
            let comment = formAsList[1].content.toString();
            if (name && comment) {
                let nameComment = name + ': ' + comment;
                nameComment = nameComment
                    .replace(/&/g, '&amp;')
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
                namesAndComments.push(nameComment.trim());
            }

            response = buildRedirect(redirects.get('/comment'), port);

            break;
        case '/registerNewAccount':

            response = buildRedirect('/', port);
            break;
        case '/conversation':
            //console.log("SENDING CHAT RENDER");
            //console.log(getHeaderInfo("Cookie:", lines))
            let cookie = getValueFromHeader('sessionToken=', getHeaderInfo("Cookie:", lines));
            //console.log("COOKE");
            //console.log(cookie);
            if (tokenUsers.has(cookie)) {
                //console.log(tokenUsers.get(cookie));
                //TODO: NOT DONDE: check the value in header

                   // response = buildRedirect('/', port);

                    response = buildHtmlResponse('./chatRender.html', []);


            }

    }
    if (response) {
        socket.write(response);
    }
}

function paths(check, socket, port, lines) {
    console.log("CHECK: " + check);
    let builtContent;
    let expr = "false";
    let contentType;
    if (availPaths.has(check)) {
        expr = availPaths.get(check);
    } else if (check === '/') {
        expr = "default";

    }else if(check.startsWith('/profile')) {
        expr = '/profile';


    } else if (check.includes("images?")) {
        let images = check.split("images=")[1].split('+');
        let name = check.split("name=")[1];
        if (name.includes('&')) {
            name = name.substring(0, name.indexOf('&'));
        }
        if (images.length !== 0 && images[images.length - 1].includes('&')) {
            images[images.length - 1] = images[images.length - 1].substr(0, images[images.length - 1].indexOf('&'));
        }
        expr = "built";
        check = '/images'
        builtContent = buildImageResponse(name, images);
    } else if (check.includes("/image") || check.includes("/User_Uploads") && check !== "/image") {
        let fileName = "." + check;
        ////console.log(userUploads);
        if (check === "/User_Uploads") {
            contentType = userUploads.get(check).contentType;
        }
        try {
            if (fs.existsSync("." + check)) {
                expr = "/image";
            }
        } catch (err) {
            console.error(err)
        }
    }

    //console.log(expr);
    let response;
    switch (expr) {
        case "built":
            response = buildResponseOK(builtContent, content.get(check)[1],
                content.get(check)[2], content.get(check)[3]);
            break;
        case "/image":
            response = buildBinaryResponse('.' + check, content.get(expr)[1],
                content.get(expr)[2], content.get(expr)[3]);
            break;

        case "content":
            // 0 File destination,1 content type,2 boolean of file or not,3 file type
            response = buildResponseOK(content.get(check)[0], content.get(check)[1],
                content.get(check)[2], content.get(check)[3]);
            break;

        case "redirect":
            response = buildRedirect(redirects.get(check), port)
            break;

        case "false":
            response = buildResponseNotFound("Not Found")
            break;
        case '/websocketDM':
        case "/websocket":
            response = createHandshake(socket, lines);
            //console.log("INIT WEB SOCK");
            upgradedUsers.set(socket.remoteAddress + socket.remotePort.toString(), new Client(socket.remoteAddress, socket.remotePort,expr, socket));
            //console.log(messageHistory);
            ////console.log(messageHistory.length);
            if (expr !== '/websocketDM') {
                for (let i = 0; i < messageHistory.length; i++) {
                    //console.log("SENDING: " + messageHistory[i]);
                    //message history really post history
                    socket.write(createWebsocketFrame(messageHistory[i]));
                }
            }


            return;

        case '/profile':
            //console.log("SENDING PROFILE");
            console.log("REAChED");
            let paths = check.split('/');
            console.log(paths);
            if (allUsers.has(paths[paths.length - 1])) {
                response = sendProfile(check);

            }

            break;
        case "default":

            response = buildDefaultResponse();
            break;
    }
    ////console.log(response);
    //console.log("SENDING RESPONSE");
    //sole.log(response.length);
    socket.write(response);
}

function sendProfile(path) {
    let content = fs.readFileSync('./profile.html');
    content = content.toString();
    console.log("PATH: " + path);
    let tempName = path.substr(path.indexOf('/', 1)+ 1);
    let user = allUsers.get(tempName);
    console.log("NAME: " + tempName);
    console.log(user);
    let usernameRender = "<p>" + user.username + "</p>";
    let postIds = "";
    for (let post in user.posts) {
        console.log("POST: " + post + "TYPE: " + typeof post + "MESSAGE: ", messageHistory[parseInt(post)]);
        let jPost = JSON.parse(messageHistory[parseInt(post)].data);
        console.log("JPOST: " , jPost);
       postIds += '<p>'  + jPost.comment + '</p> \r\n\r\n'
    }
    //user.posts.forEach(post => postIds += '<p>'  + messageHistory[post].data + messageHistory[post].data.comment + '</p> \r\n\r\n');

    content = content.replace('{{username}}', usernameRender)
        .replace('{{post}}', postIds);


    return "HTTP/1.1 200 OK\r\n" +
        "Content-Type: text/html\r\n" +
        "Content-Length: " + content.length + "\r\n\r\n" +
        content;



}





function createHandshake(socket, lines) {
    const sha1 = crypto.createHash('sha1')
    //console.log("HANDSHAKE");
    let clientKey = getHeaderInfo('Sec-WebSocket-Key:', lines) + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    sha1.update(clientKey);
    let response =
        'HTTP/1.1 101 Switching Protocols\r\n' +
        'Connection: Upgrade\r\n' +
        'Upgrade: websocket\r\n' +
        'Sec-WebSocket-Accept: ' + sha1.digest('base64') + '\r\n\r\n';
    socket.write(response);

    return response;
}

function buildRedirect(redirect, port) {
    let response = "HTTP/1.1 301 Moved Permanently\r\n"
    //response += "Content-Length: 0\r\n\r\n";
    response += "Location: http://localhost:" + port + redirect + "\r\n\r\n";

    return response
}

function buildBinaryResponse(content, mimeType, isFile, decode) {
    let display = fs.readFileSync(content);
    let response =
        "HTTP/1.1 200 OK\r\n" +
        "Content-Type: " + mimeType + "\r\n" +
        "Content-Length: " + display.length + "\r\n\r\n";

    const responseBuffer = Buffer.from(response, 'utf8')
    return Buffer.concat([responseBuffer, display]);

}

function buildResponseOK(content, mimeType, isFile, decode) {
    let length = content.length;
    let display = content;
    if (isFile) {
        display = fs.readFileSync(content);
        length = Buffer.byteLength(display)
    }
    let response =
        "HTTP/1.1 200 OK\r\n" +
        "Content-Type: " + mimeType + "\r\n" +
        "Content-Length: " + length + "\r\n\r\n" +
        display;
    return response;
}


//Pass in a 2d array each inner array should be the string
//to replace in the html file the other and array of the
// content you want to append in html form already
function buildHtmlResponse(path, replace) {
    let content = fs.readFileSync(path);
    content = content.toString();

    // html String 0 is the string to replace
    // htmlString 1 is the html to append
    replace.forEach(htmlString =>
        content.replace(htmlString[0], htmlString[1])
    );


    return "HTTP/1.1 200 OK\r\n" +
        "Content-Type: text/html\r\n" +
        "Content-Length: " + content.length + "\r\n\r\n" +
        content;
}


function buildDefaultResponse() {
    let content = fs.readFileSync('./index.html');
    let listOfNames = "";
    namesAndComments.forEach(nameNcomment => {
        listOfNames += "<p> " + nameNcomment + "</p>\r\n";
    });

    let listOfImages = "";
    userUploads.forEach(upload => {

        listOfImages +=
            '<p>' + upload.caption + '</p> \r\n' +
            '<img src="' + upload.imageName + '"' + ' class="my_image"/> \r\n';
    });

    content = content.toString()
        .replace('{{names}}', listOfNames)
        .replace('{{images}}', listOfImages);
    return "HTTP/1.1 200 OK\r\n" +
        "Content-Type: text/html\r\n" +
        "Content-Length: " + content.length + "\r\n\r\n" +
        content;
}


function buildResponseNotFound(content) {
    let response =
        "HTTP/1.1 404 Not Found\r\n" +
        "Content-Type: text/plain\r\n" +
        "Content-Length: " + content.toString().length + "\r\n\r\n" +
        content;
    ////console.log("RESPONSE: " + response)
    return response;
}


function buildImageResponse(name, imageList) {
    var temp = "";
    if (imageList !== undefined || imageList.length !== 0) {
        imageList.map(image =>
            temp += `
        <img src="image/${image}.jpg" alt=""/> 
    `);
    }
    ////console.log("TEMP ::: " + temp)
    return `
<!DOCTYPE html>

    <body>
    <p>${name}</p>
    ${temp}
    </body>
    </html>
    `;
}



