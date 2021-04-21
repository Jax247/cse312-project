let signup = false;

let login_form = document.getElementById("loginForm");
let signup_form = document.getElementById("registerForm");
let form = document.getElementById("form");
form.innerHTML = login_form.innerHTML;
document.getElementById("name").innerHTML = "AppName";

// Establish a WebSocket connection with the server
const socket = new WebSocket("ws://" + window.location.host + "/websocket");

// Call the addMessage function whenever data is received from the server over the WebSocket
// socket.onmessage = addMessage;

// Allow users to send messages by pressing enter instead of clicking the Send button
document.addEventListener("keypress", function (event) {
  event.preventDefault();
  console.log("KeyPress");
  if (event.code === "Enter" && signup) {
    console.log("ATTEMPTING TO REGISTER:");
    send_register();
  } else if (event.code === "Enter" && !signup) {
    console.log("ATTEMPTING TO LOGIN:");
    send_login();
  }
});

function signup_switch() {
  if (signup) {
    form.innerHTML = login_form.innerHTML;
    signup = false;
  } else {
    form.innerHTML = signup_form.innerHTML;
    signup = true;
  }

  console.log("Login: ", !signup);
}

function send_register() {
  const username = document.getElementById("register_username").value;
  const pw_field = document.getElementById("register_password");
  const confirm_field = document.getElementById("confirm_password").value;
  const pw = pw_field.value;
  const confirm = confirm_field.value;
  confirm_field = "";
  pw_field.value = "";
  // pw_field.focus();


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
  

}

function send_login() {
  const username = document.getElementById("login").value;
  const pw_field = document.getElementById("password");
  const pw = pw_field.value;
  pw_field.value = "";
  pw_field.focus();

  // Send information to server
  let json = JSON.stringify({
    username: username,
    password: pw,
  });
  console.log(json);
  // socket.send(json);
  // socket.send(JSON.stringify({'username': username, 'password': pw}));
}
