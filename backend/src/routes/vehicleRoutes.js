const vehicleController = require('../controllers/vehicleController');
const authController = require('../controllers/authController');
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/vehicles', vehicleController.getAllVehicles);
router.get('/vehicles/:id/imagens/:imageIndex', vehicleController.getVehicleImage);
router.get('/vehicles/:id', vehicleController.getVehicleById);
router.get('/vehicles/categoria/:categoria', vehicleController.getVehicleByCat);

/* auth */
router.post('/login', authController.Login);

/* protected routes */
router.use(authMiddleware);
router.post('/vehicles', upload.array('imagens', 10), vehicleController.createVehicle);
router.put('/vehicles/:id', upload.array('imagens', 10), vehicleController.updateVehicle);
router.delete('/vehicles/:id', vehicleController.deleteVehicle);


module.exports = router;