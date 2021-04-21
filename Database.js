const Message = require('./Message');
const User = require('./User');

class Database{
    constructor() {
        this.url = ""
    }
    setURL(url){
        this.url = url;
    }
    connect(MongoClient){
        MongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
        
            db.close();
        });
    }
    importMessages(MongoClient){
        let messageHistory = [];
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
            dbo.close
        });
        return messageHistory;
    }
    importAllUsers(MongoClient, messageHistory){
        let allUsers = [];
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            //console.log("GETTING COLLECTIOn");
    
            var users = dbo.collection('users').find();
            users.each(function (err, document) {
                if (document) {
                    let newUser = new User(document.username, "", "", document.likes);
                    if (document.chats !== "") {
                        //console.log("SETTING");
                        //console.log((document.chats));
                        newUser.setChats(jsonToMap(JSON.parse(document.chats)));
                    }
                    if (document.posts !== "") {
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
            dbo.close;
        });
        return allUsers;
    }
    usernameExists(MongoClient, username) {
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
    createUserInDB(MongoClient, username, password, user) {
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
    storePost(MongoClient, message, ownerId) {
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
    //TODO: go to user collection get user with username update their list of likes
    //TODO: ALSO UPDATE LIKE COUNT OF POST USING POST ID:
    addLikeToMongo(MongoClient, username, postId, doesLike) {
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

    addDirectMessageToMongo(MongoClient, sendUser, recvUser, message) {

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
} module.exports = Database;