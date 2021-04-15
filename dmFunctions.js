function startUp() {
    console.log(window.location.pathname);

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

        } else {
            console.log("IS BINARY");
            // binary frame
            addImage(event);
            //const view = new DataView(event);
            //console.log(view.getInt32(0));
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
