const Router = require('express');
const controller = require('../controllers/eventController');
const router = new Router();

const { check } = require('express-validator');
const auth0Middleware = require('../middleware/auth0Middleware');

router.get('/getEvents', auth0Middleware, check('email').isEmail().withMessage("email not valid"), controller.getEvents);
router.get('/getCountsEvent', auth0Middleware, controller.getCountsEvent);

router.post('/createEvent', auth0Middleware, check('email').isEmail().withMessage("email not valid"), controller.createEvent);



module.exports = router;