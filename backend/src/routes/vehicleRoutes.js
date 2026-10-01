const vehicleController = require('../controllers/vehicleController');
const express = require('express');
const router = express.Router();

router.get('/vehicles', vehicleController.getAllVehicles);
router.post('/vehicles', vehicleController.createVehicle);

module.exports = router;