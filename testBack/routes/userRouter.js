const Router = require('express');
const router = new Router();

const controller = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auth0Middleware = require('../middleware/auth0Middleware');


router.get('/users', controller.getUsers);
// router.get('/user', auth0Middleware, controller.getUser);
// router.get('/peopleFavorites', auth0Middleware, controller.peopleFavorites);
// router.get('/setCheckAccess', auth0Middleware, controller.setCheckAccess);
// router.get('/getCheckAccess', auth0Middleware, controller.getCheckAccess);
// router.get('/getThemeUser', auth0Middleware, controller.getThemeUser);
// router.get('/changeThemeUser', auth0Middleware, controller.changeThemeUser);

// router.post('/changeUser', auth0Middleware, controller.changeUser);
// router.post('/changeUserRole', auth0Middleware, controller.changeUserRole);
router.post('/createUser', controller.createUser);

module.exports = router;