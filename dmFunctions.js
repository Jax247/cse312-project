function startUp() {
    console.log(window.location.pathname);

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


        //likde.onclick = sendLike(chatMessage['id']);
        contentContainer.innerHTML += "<b>" + chatMessage['userID'] + "</b>: " + chatMessage["comment"] +  "<br/> \r\n";
        let profilePicSrc = '"pictureProfiles/defaultProfile.jpg"';
        if (chatMessage['hasProfilePic']) {
            profilePicSrc = '"pictureProfiles/' + chatMessage['userID'] + '.jpg"';
        }
        contentContainer.innerHTML += '<img id="profilePic" src=' + profilePicSrc + '>';

        contentContainer.appendChild(cardBody)
        contentContainer.appendChild(like);
        contentContainer.appendChild(postOwner);
        contentContainer.appendChild(startForm);
        document.getElementById('chat').appendChild(contentContainer);

    }
}



function sendMessage() {
    const chatName = document.getElementById("chat-name").value;
    const chatBox = document.getElementById("chat-comment");
    const comment = chatBox.value;
    chatBox.value = "";
    chatBox.focus();
    if (comment !== "") {
        let pathFront = '/conversation/';
        socket.send(JSON.stringify({'senderToken': token, 'userRecvid': recvId, 'message': comment, 'dm':true}));
    }
}


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
let recvId;

function startWebsocket() {
    console.log("STARTING SOCKET");
    token = getCookie("sessionToken");

    socket = new WebSocket('ws://' + window.location.host + '/websocketDM');
    let pathFront = '/conversation/';
    recvId = window.location.pathname.substr(pathFront.length)
    socket.onopen = function (event) {
        socket.send(JSON.stringify({'dmnotify': token, 'dm': true, 'userRecvid': recvId}));
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

        }
    });


    // socket.onmessage(function (type) {
    //     console.log("MESSAGE EVT");
    //     console.log(type);
    //     console.log(type.toString());
    //
    // });
//socket.onmessage = addMessage;
}
