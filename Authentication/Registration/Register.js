class Register{
    constructor(request, response) {
        this.request = request;
        this.response = response;
        this.username;
        this.password;
        this.init();
    }


    //Get more account info
    init(){
        this.username = this.request.body.username;
        this.password = this.request.body.password;
    }


    //Temp name
    requestToSql(){
        //TODO: Create a new account in db
        //TODO: If success call Login or just redirect with cookie?

    }



}mmodule.exports = Register;