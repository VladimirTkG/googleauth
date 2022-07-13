const jwt = require('jsonwebtoken');
const { secret } = require('../config/config');


class jwtToken {
    generateAccessToken = (id, roles) => {
        const payload = {
            id, roles
        }
        return jwt.sign(payload, secret);
    }

    decodeAccessToken = (token) => {

        const decodeData = jwt.verify(token, secret);
        return decodeData;
    }
}

module.exports = new jwtToken();