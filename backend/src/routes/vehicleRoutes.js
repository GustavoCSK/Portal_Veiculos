const vehicleController = require('../controllers/vehicleController');
const express = require('express');
const router = express.Router();

router.get('/vehicles', vehicleController.getAllVehicles);
router.post('/vehicles', vehicleController.createVehicle);
router.get('/vehicles/:id', vehicleController.getVehicleById);
router.get('/vehicles/categoria/:categoria', vehicleController.getVehicleByCat);

module.exports = router;