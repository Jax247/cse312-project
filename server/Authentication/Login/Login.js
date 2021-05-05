class Login{
    constructor(request, response) {
        this.request = request;
        this.response = response;
        this.username;
        this.password;
        this.init();
    }

    init(){
        this.username = this.request.body.username;
        this.password = this.request.body.password;
    }


    //Temp name
    requestToSql(){
        //TODO: If username and password is correct
        //TODO: Login and redirect to feed
        //TODO: Render wrong password or username

    }



}module.exports = Login;