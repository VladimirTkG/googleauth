const { google } = require('googleapis');


const TOKEN_PATH = require('../config/token.json');
const secretKey = require('../config/secretKey.json')

class googleAuth {

    authorizeToken() {
        const { client_secret, client_id, redirect_uris } = secretKey.installed
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        // console.log(oAuth2Client)
        oAuth2Client.setCredentials(TOKEN_PATH)
        // console.log(oAuth2Client)
        return oAuth2Client;
    }
}

module.exports = new googleAuth();