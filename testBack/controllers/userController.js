const User = require('../models/User');
const Role = require('../models/Role');
const People = require('../models/People');
const AccessCheck = require('../models/AccessCheck');
const mongoose = require('mongoose');
const axios = require('axios');
const { google } = require('googleapis');
class userController {

    async getUsers(req, res) {
        try {
            const { page } = req.query;


            if (page) {
                await User.paginate({}, { page: page, limit: 10 }, function (err, result) {
                    return res.status(200).json(result);
                });
            } else {
                const users = await User.find();
                return res.status(200).json(users);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    }

    // async getUser(req, res) {
    //     try {
    //         const users = await User.findOne({ sub: req.user_id });
    //         return res.status(200).json(users);
    //     } catch (error) {
    //         console.log('error: ', error);
    //     }
    // }

    // async peopleFavorites(req, res) {
    //     try {
    //         const { _id } = req.query;
    //         const people = await People.findById(_id);

    //         if (!people) {
    //             return res.status(404).json({ message: "people not found" });
    //         }

    //         const user = await User.findOne({ sub: req.user_id });

    //         var result = await user.peopleFavorites.some(function (people) {
    //             return people.equals(_id);  // search by people id in favorites
    //         });

    //         if (result) {
    //             user.peopleFavorites.pull(_id);  // delete id from favorite
    //             await user.save();
    //         } else {
    //             user.peopleFavorites.push(_id);  // add id to favorite
    //             await user.save();
    //         }

    //         return res.status(200).send(user);
    //     } catch (error) {
    //         console.log('error: ', error);
    //         return res.status(404).json({ message: "error" });
    //     }
    // }

    // async setCheckAccess(req, res) {
    //     try {

    //         const access = await AccessCheck.findOne();

    //         if (access) {
    //             await AccessCheck.updateMany(
    //                 { "check": req.query.check }
    //             );
    //         } else {
    //             const check = new AccessCheck({ check: req.query.check });
    //             await check.save();
    //         }

    //         return res.status(200).json({ message: "Validation changed" });
    //     } catch (error) {
    //         console.log('error: ', error);
    //         return res.status(400).json({ message: "error" });
    //     }
    // }

    // async getCheckAccess(req, res) {

    //     try {
    //         const access = await AccessCheck.findOne();
    //         return res.status(200).json({ check: access.check });
    //     } catch (error) {
    //         console.log('error: ', error);
    //         return res.status(400).json({ message: "error" });
    //     }

    // }

    // async changeUser(req, res) {
    //     try {
    //         const { interior_user_id } = req;
    //         const { industry, subIndustry } = req.body;

    //         User.findOneAndUpdate({ _id: interior_user_id }, { industry, subIndustry }, { new: true }, (err, doc) => {
    //             if (err) {
    //                 console.log("Something wrong when updating data!", err);
    //                 res.status(500).json({
    //                     message: "Something wrong when updating data!"
    //                 });
    //             }
    //             return res.status(200).json({ message: "Chenged succesfully", doc });
    //         })
    //     } catch (error) {
    //         console.log('error: ', error);
    //         return res.status(400).json({ message: "error" });
    //     }

    // }

    // async changeUserRole(req, res) {
    //     try {
    //         const { role, _id } = req.body;

    //         if (!mongoose.Types.ObjectId.isValid(_id)) {
    //             return res.status(404).json({ message: "unknown id" });
    //         }

    //         User.findOneAndUpdate({ _id: _id }, { roles: role }, { new: true }, (err, doc) => {
    //             if (err) {
    //                 console.log("Something wrong when updating data!", err);
    //                 res.status(500).json({
    //                     message: "Something wrong when updating data!"
    //                 });
    //             }
    //         })

    //         return res.status(200).json({ message: "Admin added" });
    //     } catch (error) {
    //         console.log('error: ', error);
    //         return res.status(400).json({ message: "error" });
    //     }

    // }

    // async getThemeUser(req, res) {
    //     try {
    //         const { interior_user_id } = req;

    //         const user = await User.findOne({ _id: interior_user_id })

    //         const theme = user.themeSelect;

    //         return res.status(200).json({ themeSelect: theme });
    //     } catch (error) {
    //         console.log('error: ', error);
    //         return res.status(400).json({ message: "error" });
    //     }

    // }

    // async changeThemeUser(req, res) {
    //     try {
    //         const { theme } = req.query;
    //         const { interior_user_id } = req;

    //         User.findOneAndUpdate({ _id: interior_user_id }, { themeSelect: theme }, { new: true }, (err, doc) => {
    //             if (err) {
    //                 console.log("Something wrong when updating data!", err);
    //                 res.status(500).json({
    //                     message: "Something wrong when updating data!"
    //                 });
    //             }
    //         })

    //         return res.status(200).json({ message: `Changed theme to ${theme}` });
    //     } catch (error) {
    //         console.log('error: ', error);
    //         return res.status(400).json({ message: "error" });
    //     }

    // }


    async createUser(req, res) {
        try {

            const code = req.headers.codegmail;
            const GOOGLE_CLIENT_ID = '214238479226-oss7l4kjcn86esb68b64qp9fonju82sq.apps.googleusercontent.com';
            const GOOGLE_CLIENT_SECRET = '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';
            const GOOGLE_REDIRECT_URI = 'http://localhost:3000/authPage';

            const oAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
            const { tokens } = await oAuth2Client.getToken(code)
            oAuth2Client.setCredentials(tokens);

            const googleAuth = google.oauth2({
                auth: oAuth2Client,
                version: 'v2'
            });

            const userInfo = await googleAuth.userinfo.get();
            res.json(userInfo)
            // const GOOGLE_USER_INFO_URI = 'https://www.googleapis.com/oauth2/v1/userinfo';
            // const { token } = req.headers;
            // const config = {
            //     method: 'get',
            //     url: GOOGLE_USER_INFO_URI,
            //     headers: {
            //         // authorization: `Bearer ${token}`
            //         'Authorization': `${token}`
            //     }
            // }
            // await axios(config)
            //     .then(async resp => {
            //         console.log(resp.data)
            //         const { id, email, family_name, given_name, name, picture, verified_email } = resp.data
            //         const candidate = await User.findOne({ email })
            //         if (!candidate) {
            //             const user = new User({ id, email, family_name, given_name, name, picture, verified_email });
            //             await user.save()
            //         }
            //         res.json(resp.data)
            //         // setData(JSON.stringify(res.data))
            //     })
            //     .catch(err => console.log(err))
        } catch (e) {
            console.log(e)
        }
    }

}

module.exports = new userController();