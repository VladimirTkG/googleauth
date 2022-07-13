const {decodeAccessToken} = require('../utils/jwt');

module.exports = function(roles) {
    return function(req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {
            const token = req.headers.authorization.split(' ')[1];

            console.log('req.headers = ', req.headers);

            if( !token ) {
                return res.status(403).json({message: "user not authorize"});
            }

            const {roles: userRoles} = decodeAccessToken(token);

            console.log('decodeAccessToken(token) = ', decodeAccessToken(token));

            let hasRole = false;

            userRoles.forEach(role => {
                if( roles.includes(role) ) {
                    hasRole = true;
                }
            });

            if ( !hasRole ) {
                return res.status(403).json({message: "This user does not have access"});
            }

            next();

        } catch (e) {
            console.log(e);
            return res.status(403).json({message: "user not authorize"});
        }
    }
};