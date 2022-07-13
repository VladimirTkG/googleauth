const axios = require('axios');
const User = require('../models/User');
const { LookAccess, UserAccessCheck } = require('../utils/AccessCheck');
require('dotenv').config();

module.exports = async function (req, res, next) {

    try {
        const { user_id } = req.headers;
        const check = await LookAccess();

        if (check) {
            const userAccess = await UserAccessCheck(req, res, user_id);

            if (userAccess.error) {
                return res.status(userAccess.statusCode).json(userAccess);
            }

            if (!userAccess) {
                return res.status(403).json({ message: "This user does not have access", access: false });
            }
        }

        const user = await User.findOne({ sub: user_id });

        req.user_id = user_id;
        req.interior_user_id = user._id;

        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error" });
    }

};