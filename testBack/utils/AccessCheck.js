const AccessCheck = require('../models/AccessCheck');
const axios = require('axios');
class CheckAccess {

    UserAccessCheck = async (req, res, user_id) => {
        let config = {
            method: 'get',
            url: `${process.env.AUTH0_DOMAIN}api/v2/users/${user_id}/roles`,
            headers: {
                'authorization': `Bearer ${process.env.MGMT_API_ACCESS_TOKEN}`
            }
        };

    return await axios(config)
        .then(function (response) {

            const roles = JSON.stringify(response.data);

            if ( !roles.includes('irm_access') ) {
                return false;
            } else {
                return true;
            }
        })
        .catch(function (error) {
            console.log('error == ', error.response.data);
            return error.response.data;
        });
    }

    LookAccess = async () => {
        try {
            const check = await AccessCheck.findOne();
            return check.check;
        } catch (error) {
            console.log('error: ', error);
        }
    }
}

module.exports = new CheckAccess();