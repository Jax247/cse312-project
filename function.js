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
    let updateElement = document.getElementById('like' + jLike['messageId'].toString());
    console.log(updateElement);

    updateElement.innerHTML = jLike['totalLike'];

}


function addMessage(message) {
    const chatMessage = JSON.parse(message.data);
    if (chatMessage.like === 'sent') {
        updateLike(message);
    } else {
        let contentContainer = document.createElement('div');
        console.log("ID: " + chatMessage['id']);
        contentContainer.className = "card bg-light mb-3";
        contentContainer.id = "messsage" + chatMessage['id'];
        let cardHead = document.createElement('div');
        cardHead.className = "card-header";
        cardHead.innerHTML = chatMessage['username'] + " Posted!"
        contentContainer.appendChild(cardHead);
        let cardBody = document.createElement('div');
        cardBody.className = "card-body";

        let likeCount = document.createElement('p');
        likeCount.id = 'like' + chatMessage['id'].toString();
        likeCount.innerHTML = "LIKES: " + chatMessage['likeCount'];
        let startForm = document.createElement('form');
        let postOwner = document.createElement('a');
        postOwner.innerHTML = chatMessage['userID'];
        postOwner.addEventListener('click', function () {
            location.href = window.location.href + 'profile/' + chatMessage['userID'];
        })
        
        startForm.action = "/conversation/" + chatMessage['userID'];
        startForm.method = 'post';
        startForm.enctype = "multipart/form-data";
        let startButton = document.createElement('input');
        startButton.type = 'submit';
        startButton.value = 'Send Chat';
        startForm.appendChild(startButton);

        let like = document.createElement('i');
        like.addEventListener('click', function () {
            sendLike(chatMessage['id']);
        });
        //like.onclick = sendLike(chatMessage['id']);
        like.className = 'fas fa-cloud';
        contentContainer.innerHTML += "<b>" + chatMessage['userID'] + "</b>: " + chatMessage["comment"] +  "<br/> \r\n";
        let profilePicSrc = '"pictureProfiles/defaultProfile.jpg"';
        if (chatMessage['hasProfilePic']) {
            profilePicSrc = '"pictureProfiles/' + chatMessage['userID'] + '.jpg"';
        }
        contentContainer.innerHTML += '<img id="profilePic" src=' + profilePicSrc + '>';

        contentContainer.appendChild(cardBody)
        contentContainer.appendChild(like);
        contentContainer.appendChild(likeCount);
        contentContainer.appendChild(postOwner);
        contentContainer.appendChild(startForm);
        document.getElementById('chat').appendChild(contentContainer);

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


let socket;
let token;

function startWebsocket() {
    console.log("STARTING SOCKET");
    token = getCookie("sessionToken");

    socket = new WebSocket('ws://' + window.location.host + '/websocket');


    socket.onopen = function (event) {
        socket.send(JSON.stringify({'notify': token }));
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



