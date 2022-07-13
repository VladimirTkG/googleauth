const Router = require('express');
const { check } = require('express-validator');
const router = new Router();

const controller = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// router.post('/registration', [
//     check('email').not()
//     .isEmpty()
//     .withMessage("email is required")
//     .bail()
//     .isEmail()
//     .withMessage("email not valid"),
//     check('password', "password min 4 max 10").isLength({min: 4, max: 10})
// ], controller.registration);
router.post('/registration', controller.registration);
router.post('/login', controller.auth);
router.post('/changePassword', [
    check('newPassword', 'password min 4 max 10')
    .isLength({min: 4, max: 10})
], controller.changePassword);

module.exports = router;