function welcomeAlert() {
    alert("If you're seeing this, your server sent functions.js!")
}

//module.exports = {addImages}


function sendMessage() {
    const chatName = document.getElementById("chat-name").value;
    const chatBox = document.getElementById("chat-comment");
    const comment = chatBox.value;
    chatBox.value = "";
    chatBox.focus();
    if (comment !== "") {
        socket.send(JSON.stringify({'username': chatName, 'comment': comment, 'sessionToken': token}));
    }
}

function sendLike(id) {
    let sent = 'sent';
    console.log("ID: " + id)
    socket.send(JSON.stringify({'like': sent, 'sessionToken': token, 'messageId': id}))
}

function updateLike(like) {
    console.log("UPDATING LIKE");
    const jLike = JSON.parse(like.data);
    let updateElement = document.getElementById('likeIcon' + jLike['messageId'].toString());
    document.getElementById('like' + jLike.messageId).innerHTML = jLike.totalLike;
    console.log(updateElement);
    if (jLike.updateLike === "update") {
        if (jLike.doesLike) {
            console.log("DOES LIKE")
            updateElement.innerHTML = 'favorite';
        } else {
            console.log("DOES NOT LIKE")

            updateElement.innerHTML = 'favorite_border';
        }
    }
}

function containsUser(list, id){
    list.forEach(user => {
        if (user === id){
            return true;
        }
    })
    return false;
}

//Use createConvo button to create the button
// that will link users to the chat screen
let activeUsers = [];
function renderActiveUsers(listOfUsers) {
    let activeUserCont
    let AUentry
    let AUentry_name
    let span

    // Render list of incoming usernames in a ul tag
    console.log("List of users:\n", listOfUsers);

    let Activelist = document.getElementById("list");

    Activelist.innerHTML = "";

    // Add each string to the list by contructing the html elements to insert into the misc lane
    
    for (let index = 0; index < listOfUsers.length; index++) {
        if(containsUser(activeUsers, listOfUsers[index])){
            console.log("ALREADY ACTIVE")
            continue;
        }

        activeUserCont = document.createElement("div");
        activeUserCont.id = "activeUsers";
        activeUserCont.class = "activeUsers";

        AUentry = document.createElement('div');
        AUentry.class = "accordion-body";

        AUentry_name = document.createElement('span');
        AUentry_name.class = "AUentry_name";
        AUentry_name.innerHTML = listOfUsers[index];

        span = document.createElement('span');
        span.classname = "svgi";
        span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" fill="green" class="bi bi-dot" viewBox="0 0 16 16">
        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
      </svg>`


        AUentry.append(AUentry_name);
        AUentry.append(span)
        activeUserCont.append(AUentry);

        console.log("loop")
        activeUsers.push(listOfUsers[index])
        Activelist.append(activeUserCont);
    }
    
    
}


function addMessage(message) {
    const chatMessage = JSON.parse(message.data);
    
    if (chatMessage.like === 'sent') {
        updateLike(message);
    } else if (chatMessage.activeUsers > 1) {
        renderActiveUsers(chatMessage.userId);
    } else if (chatMessage.yourLikes) {
        yourLikes = new Set(JSON.parse(chatMessage.yourLikes));
    }  else {
       console.log(chatMessage);
        let contentContainer = document.createElement('div');
        console.log("ID: " + chatMessage['id']);
        contentContainer.className = "raised card bg-light mb-3";
        contentContainer.id = "messsage" + chatMessage['id'];
        let cardHead = document.createElement('div');
        cardHead.className = "card-header";
        cardHead.innerHTML = chatMessage['username'] + " Posted!"; //not username but title
        contentContainer.appendChild(cardHead);
        let cardBody = document.createElement('div');
        cardBody.className = "card-body";

        let likeCount = document.createElement('p');
        likeCount.id = 'like' + chatMessage['id'].toString();
        likeCount.innerHTML = "LIKES: " + chatMessage['likeCount'];
        let startForm = document.createElement('form');


        startForm.action = "/conversation/" + chatMessage['userID'];
        startForm.method = 'post';
        startForm.enctype = "multipart/form-data";
        let startButton = document.createElement('input');
        startButton.type = 'submit';
        startButton.value = 'Send Chat';
        startForm.appendChild(startButton);

        let like = document.createElement('i');
        like.id = 'likeIcon' + chatMessage.id;
        like.addEventListener('click', function () {
            sendLike(chatMessage['id']);
        });
        //like.onclick = sendLike(chatMessage['id']);

        if (yourLikes.has(chatMessage.id)) {
            like.innerHTML = 'favorite';
        } else {
            like.innerHTML = 'favorite_border';

        }
        cardBody.innerHTML += "<b>" + chatMessage['userID'] + "</b><br/> " + chatMessage["comment"] + "<br/> \r\n";

        like.className = 'material-icons';
        contentContainer.innerHTML += "<b>" + chatMessage['userID'] + "</b>: " + chatMessage["comment"] + "<br/> \r\n";
        let profilePicSrc = '"pictureProfiles/defaultProfile.jpg"';
        if (chatMessage['hasProfilePic']) {
            profilePicSrc = '"pictureProfiles/' + chatMessage['userID'] + '.jpg"';
        }
        

        let postOwner = document.createElement('a');
        postOwner.innerHTML = '<img id="" class="pfp" src=' + profilePicSrc + '> ' + chatMessage['userID'] + ' Posted!';
        postOwner.addEventListener('click', function () {
            location.href = window.location.href + 'profile/' + chatMessage['userID'];
        });



        // card header
        let cardHead = document.createElement('span');
        cardHead.className = "card-header";
        contentContainer.prepend(cardHead);
        cardHead.append(postOwner)

        // contentContainer.innerHTML += '<img id="profilePic" class="pfp" src=' + profilePicSrc + '>';

        contentContainer.append(cardBody);
        cardBody.append(like);
        cardBody.append(likeCount);
        // cardBody.append(postOwner);
        cardBody.append(startForm);
        document.getElementById('chat').prepend(contentContainer);

    }
}


function addImage(image) {
    let chat = document.getElementById('chat');
    const reader = new FileReader();
    var bytes = new Uint8Array(image.data);
    var blob = new Blob([bytes.buffer]);
    reader.addEventListener('loadend', () => {
        // reader.result contains the contents of blob as a typed array
        console.log(reader.result);
        var img = document.createElement('img');
        chat.appendChild(img);
        img.src = "data:image/jpg;base64," + btoa(reader.result);
        img.className = 'my_image';

    });
    reader.readAsBinaryString(image.data)


}

//W3 Schools
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function createConvoButton(name) {

    let button = document.createElement('button');
    button.id = 'goToProfileButton';
    button.innerHTML = 'Go to profile';

    button.addEventListener('click', function () {
        location.href = window.location.href + 'profile/' + name;
    })

    return button;
}


let socket;
let token;
let userName;

function startWebsocket() {
    console.log("STARTING SOCKET");
    token = getCookie("sessionToken");
    userName = getCookie("yourName");
    socket = new WebSocket('ws://' + window.location.host + '/websocket');

    document.getElementById('createContainer').appendChild(createConvoButton(userName))

    socket.onopen = function (event) {
        socket.send(JSON.stringify({'notify': token}));
    };

// Call the addMessage function whenever data is received from the server over the WebSocket
    socket.addEventListener("message", function (event) {
        console.log("EVETNt");
        console.log(typeof event.data)
        if (typeof event.data === 'string') {

            console.log("IS TEXT");
            // text frame
            console.log(event.data.toString());
            addMessage(event);

        } else {
            console.log("IS BINARY");
            // binary frame
            addImage(event);
            //const view = new DataView(event);
            //console.log(view.getInt32(0));
        }
    });


    socket.onmessage(function (type) {
        console.log("MESSAGE EVT");
        console.log(type);
        console.log(type.toString());

    });
    //socket.onmessage = addMessage;


// Allow users to send messages by pressing enter instead of clicking the Send button
    document.addEventListener("keypress", function (event) {
        if (event.code === "Enter") {
            sendMessage();
        }
    });


}

function sendFile() {

    var file = document.getElementById('filename').files[0];

    var reader = new FileReader();

    var rawData = new ArrayBuffer();

    reader.loadend = function () {

    }

    reader.onload = function (e) {

        rawData = e.target.result;

        socket.send(rawData);

        alert("the File has been transferred.")

    }

    reader.readAsArrayBuffer(file);

}



