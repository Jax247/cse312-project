const express = require('express')
const app = express()
const path = require('path')
const Login = require('./Authentication/Login/Login');
const port = 8000

app.use(express.urlencoded({
    extended: true,
}))

app.use(express.static('Authentication/Login/LoginRender/'))

app.get('/', (req, res) => {
    // console.log(req, '\n + res');
    res.sendFile(__dirname + '/Authentication/Login/LoginRender/Homepage.html');
})

app.post('/login', (req, res) => {
    console.log("LOGIN");
    let newLogin = new Login(req, res);
    console.log(newLogin);
    res.redirect('/');
})

app.post('/register', (req, res) => {
    console.log("LOGIN");
    let newLogin = new Login(req, res);
    console.log(newLogin);
    res.redirect('/');
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

