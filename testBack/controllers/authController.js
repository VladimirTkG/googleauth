const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const {generateAccessToken} = require('../utils/jwt');
const {LookAccess, UserAccessCheck} = require('../utils/AccessCheck');

const {validationResult} = require('express-validator');

class authController {
    async registration(req, res) {
        try {
            const { user_id } = req.headers;
            const userAccess = await UserAccessCheck(req, res, user_id);
            const check = await LookAccess();

            if ( userAccess.error  ) {
                return res.status(userAccess.statusCode).json(userAccess);
            }

            // const errors = validationResult(req);

            // if ( !errors.isEmpty() ) {
            //     return res.status(200).json({message: errors})
            // }

            const { email } = req.body;
            const candidate = await User.findOne({email});

            if ( candidate ) {
                if ( !userAccess && check ) {
                    return res.status(403).json({message: "This user does not have access", access: false});
                }
                return res.status(200).json({message: 'User with this email already exists', dataUser: candidate, access: true});
            }

            // const salt = bcrypt.genSaltSync(10);
            // const hashPassword = bcrypt.hashSync(password, salt);
            // const userRole = await Role.findOne({value: "USER"});
            const user = new User(req.body);
            await user.save();
            if ( !userAccess && check ) {
                return res.status(403).json({message: "This user does not have access", access: false});
            } else {
                return res.json({message: "User successfully added", dataUser: user, access: true});
            }
        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({message: 'Registration error'});
        }
    }

    async auth(req, res) {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({email});

            if ( !user ) {
                return res.status(404).json({message: `User ${email} not found`});
            }

            const validPassword  = bcrypt.compareSync(password, user.password);

            if ( !validPassword ) {
                return res.status(400).json({message: `wrong password`});
            }

            const token = generateAccessToken(user._id, user.roles);
            const userData = await User.findById(user._id).select("-password");
            return res.json({token, userData});

        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({message: 'login error'});
        }
    }

    async changePassword(req, res) {
        try {
            const {oldPassword, newPassword, confirmPassword} = req.body;

            const user = await User.findById(req.user.id);
            const validPassword  = bcrypt.compareSync(oldPassword, user.password);

            if ( !validPassword ) {
                return res.status(400).json({message: `Wrong old password`});
            }

            const errors = validationResult(req);

            if ( !errors.isEmpty() ) {
                return res.status(200).json({message: errors});
            }

            if ( newPassword !== confirmPassword ) {
                return res.status(422).json({message: `Passwords do not match`});
            }

            const salt = bcrypt.genSaltSync(10);
            const hashPassword = bcrypt.hashSync(newPassword, salt);

            User.findByIdAndUpdate({_id: user._id},
                {
                    $set : {
                    password: hashPassword
                    }
                });

            return res.status(200).json({message: `Password changed successfully`});
        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({message: 'Change password error'});
        }
    }

}

module.exports = new authController();