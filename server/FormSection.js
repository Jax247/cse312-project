class FormSection{
    constructor(contentDisp, contentT, cont) {
        //String
        this.contentDisposition = contentDisp;
        //String
        this.contentType = contentT;
        //Bytes
        this.content = cont;
    }
}
module.exports = FormSection;