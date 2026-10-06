const vehicleController = require('../controllers/vehicleController');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/vehicles', vehicleController.getAllVehicles);
router.post('/vehicles', upload.single('imagem'), vehicleController.createVehicle);
router.get('/vehicles/:id/imagem', vehicleController.getVehicleImage);
router.get('/vehicles/:id', vehicleController.getVehicleById);
router.get('/vehicles/categoria/:categoria', vehicleController.getVehicleByCat);

module.exports = router;