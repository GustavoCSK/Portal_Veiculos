const vehicleModel = require('../models/vehicleModel');

exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await vehicleModel.getAllVehicles();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vehicles', error: error.message });
    }
};

exports.createVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;
        const newVehicle = await vehicleModel.createVehicle(vehicleData);
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vehicle', error: error.message });
    }
};