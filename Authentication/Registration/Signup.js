let signup = false;

let signup_form = document.getElementById("registerForm");
let form = document.getElementById("form");
form.innerHTML = login_form.innerHTML;
document.getElementById("name").innerHTML = "AppName";

// Establish a WebSocket connection with the server
const socket = new WebSocket("ws://" + window.location.host + "/websocket");

// Call the addMessage function whenever data is received from the server over the WebSocket
// socket.onmessage = addMessage;

login_form.addEventListener('submit', function(e) {
  console.log("IM HERE BOSS");
})


// Allow users to send messages by pressing enter instead of clicking the Send button
document.addEventListener("keypress", function (event) {
  console.log("keypress: " + event.code)
  
});

socket.addEventListener("message", function (event) {
  console.log("EVENT:");
  console.log(typeof event.data)
  if (typeof event.data === 'string') {

      console.log("IS TEXT");
      // text frame
      console.log(event.data.toString());
      // addMessage(event);

  } else {
      console.log("IS BINARY");
  }
});

function send_register() {

  const username = document.getElementById("register_username").value;
  const pw_field = document.getElementById("register_password");
  const confirm_field = document.getElementById("confirm_password").value;
  const pw = pw_field.value;
  const confirm = confirm_field.value;
  confirm_field = "";
  pw_field.value = "";
  pw_field.focus();


  // Password Validation
  if (pw === confirm && pw.length >= 5) {
    let json = JSON.stringify({
      username: username,
      password: pw,
    });
    form.innerHTML = json;
    // socket.send(json);
  } else if (pw !== confirm) {
    alert("Password dont match up... Try again");
    return;
  } else if (pw === confirm && pw.length < 5) {
    alert("Password must beat least 5 characters");
    return;
  }
  
  console.log("Validated");

}