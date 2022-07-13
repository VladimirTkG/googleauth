const { google } = require("googleapis");
const { authorizeToken } = require("../utils/googleAuth");



const UpdateWatch = async () => {
        const auth = authorizeToken();
        const gmail = google.gmail({ version: 'v1', auth });

        const request = {
            'labelIds': ['INBOX'],
            'labelFilterAction': "include",
            'topicName': 'projects/emailgettingmessage/topics/MessageNotification'
        }
        gmail.users.watch({
            userId: 'me',
            requestBody: request
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
        })
}

module.exports = UpdateWatch;