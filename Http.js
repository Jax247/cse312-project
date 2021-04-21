const fs = require('fs');

class Http{
    constructor() {
    }
    buildRedirect(redirect, port) {
        let response = "HTTP/1.1 301 Moved Permanently\r\n"
        //response += "Content-Length: 0\r\n\r\n";
        response += "Location: http://localhost:" + port + redirect + "\r\n\r\n";
    
        return response
    }
    buildBinaryResponse(content, mimeType, isFile, decode) {
        let display = fs.readFileSync(content);
        let response =
            "HTTP/1.1 200 OK\r\n" +
            "Content-Type: " + mimeType + "\r\n" +
            "Content-Length: " + display.length + "\r\n\r\n";
    
        const responseBuffer = Buffer.from(response, 'utf8')
        return Buffer.concat([responseBuffer, display]);
    
    }
    buildResponseOK(content, mimeType, isFile, decode) {
        let length = content.length;
        let display = content;
        if (isFile) {
            display = fs.readFileSync(content);
            length = Buffer.byteLength(display)
        }
        let response =
            "HTTP/1.1 200 OK\r\n" +
            "Content-Type: " + mimeType + "\r\n" +
            "Content-Length: " + length + "\r\n\r\n" +
            display;
        return response;
    }
    //Pass in a 2d array each inner array should be the string
    //to replace in the html file the other and array of the
    // content you want to append in html form already
    buildHtmlResponse(path, replace) {
        let content = fs.readFileSync(path);
        content = content.toString();

        // html String 0 is the string to replace
        // htmlString 1 is the html to append
        replace.forEach(htmlString =>
            content.replace(htmlString[0], htmlString[1])
        );


        return "HTTP/1.1 200 OK\r\n" +
            "Content-Type: text/html\r\n" +
            "Content-Length: " + content.length + "\r\n\r\n" +
            content;
    }
    buildResponseNotFound(content) {
        let response =
            "HTTP/1.1 404 Not Found\r\n" +
            "Content-Type: text/plain\r\n" +
            "Content-Length: " + content.toString().length + "\r\n\r\n" +
            content;
        ////console.log("RESPONSE: " + response)
        return response;
    }
    buildImageResponse(name, imageList) {
        var temp = "";
        if (imageList !== undefined || imageList.length !== 0) {
            imageList.map(image =>
                temp += `
            <img src="image/${image}.jpg" alt=""/> 
        `);
        }
        ////console.log("TEMP ::: " + temp)
        return `
    <!DOCTYPE html>
    
        <body>
        <p>${name}</p>
        ${temp}
        </body>
        </html>
        `;
    }
} module.exports = Http;