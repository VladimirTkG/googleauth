const Router = require('express');
const controller = require('../controllers/messageController');
const router = new Router();

const auth0Middleware = require('../middleware/auth0Middleware');
const { check } = require('express-validator');

router.get('/getMessages', auth0Middleware, check('email').isEmail().withMessage("email not valid"), controller.getMessages);
router.get('/deleteSampleMessage', controller.deleteSampleMessage);
router.get('/getSampleMessages', controller.getSampleMessages);
router.get('/getChosenSampleMessage', controller.getChosenSampleMessage);
router.get('/setChosenSample', controller.setChosenSampleMessage);
router.get('/getCountsMessages', auth0Middleware, controller.getMessageCounts);
router.get('/getDataMessage', auth0Middleware, controller.getMessageData)
router.get('/getUnreadLeadNotification', auth0Middleware, controller.getUnreadLead)

router.post('/sendMessage', auth0Middleware, controller.sendMessage)
router.post('/createSampleMessage', controller.createSampleMessage)
router.post('/updateSampleMessage', controller.updateSampleMessage)
router.post('/getNotification', controller.getNotification)


// router.post('/notification', async (req, res) => {
//     console.log(req.body)
// })


module.exports = router;