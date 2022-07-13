const Router = require('express');
const router = new Router();

const controller = require('../controllers/listController');
const auth0Middleware = require('../middleware/auth0Middleware');

router.post('/createList', auth0Middleware, controller.createList);
router.post('/updateList', controller.updateList);

router.get('/getLists', auth0Middleware, controller.getLists);
router.get('/deleteList', controller.deleteList);
router.get('/exportListToCVS', controller.exportListToCsv);
router.get('/exportListToXlsx', controller.exportListToXlsx);
router.get('/exportListLeadsToCSV', controller.exportListLeadsToCsv);
router.get('/exportListLeadsToXlsx', controller.exportListLeadsToXlsx);

router.post('/importListLeadsFromCSV', auth0Middleware, controller.importListLeadsFromCSV)
router.post('/importListLeadsFromXLSX', auth0Middleware, controller.importListLeadsFromXlsx)

module.exports = router;