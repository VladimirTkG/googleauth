const Router = require('express');
const router = new Router();
const { check, param } = require('express-validator');

const controller = require('../controllers/peopleController');
const authMiddleware = require('../middleware/authMiddleware');
const auth0Middleware = require('../middleware/auth0Middleware');
// const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/addPeople', [check('email').isEmail().withMessage("email not valid"),
check('leadStatus').isIn(['No action', 'Message Received', 'Message sent'])], auth0Middleware, controller.addPeople);
router.get('/getAllPeople', auth0Middleware, controller.getAllPeople);
router.get('/countPeople', auth0Middleware, controller.countAllPeople);
router.get('/getPeople', auth0Middleware, controller.getPeople);
router.get('/getPeopleFromSlug', auth0Middleware, controller.getPeopleFromSlug);
router.get('/deletePeople', auth0Middleware, controller.deletePeople);
router.post('/updatePeople', [check('email').isEmail().withMessage("email not valid"),
check('leadStatus').isIn(['No action', 'Message Received', 'Message sent'])], auth0Middleware, controller.updatePeople);
router.post('/peopleInLead', auth0Middleware, controller.peopleInLead)


module.exports = router;