const Router = require('express');
const router = new Router();
const { check } = require('express-validator');

const controller = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');
const auth0Middleware = require('../middleware/auth0Middleware');
// const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/addLead', check('email').isEmail().withMessage("email not valid"),
// check('leadStatus').isIn(['No action', 'Message Received', 'Message sent'])], 
auth0Middleware, controller.addLead);
router.get('/getAllLeads', auth0Middleware, controller.getAllLeads);
router.get('/countLeads', auth0Middleware, controller.countAllLeads);
router.get('/getLeadsStatuses', auth0Middleware, controller.getLeadsStatuses);
router.get('/getLead', auth0Middleware, controller.getLead);
router.get('/deleteLead', auth0Middleware, controller.deleteLead);
router.get('/getLeadsUser', auth0Middleware, controller.getLeadsUser);

router.post('/updateLead', check('email').isEmail().withMessage("email not valid"),
// check('leadStatus').isIn(['No action', 'Message Received', 'Message sent'])],
 auth0Middleware, controller.updateLead);

router.get('/getNotification', auth0Middleware, controller.getNotification)

router.get('/loadCSV', auth0Middleware, controller.exportToCsv);
router.get('/loadXLSX', auth0Middleware, controller.exportToXlsx);

router.post('/importCSV', auth0Middleware, controller.importFromCSV);
router.post('/importXLSX', auth0Middleware, controller.importFromXlsx);

module.exports = router;