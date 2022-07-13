const {decodeAccessToken} = require('../utils/jwt');

module.exports = function(req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];

        if( !token ) {
            return res.status(403).json({message: "user not authorize"});
        }

        const decodeData = decodeAccessToken(token);
        req.user = decodeData;
        next();

    } catch (e) {
        console.log(e);
        return res.status(403).json({message: "user not authorize"});
    }
};