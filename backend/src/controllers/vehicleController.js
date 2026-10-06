const vehicleModel = require('../models/vehicleModel');
const mongoose = require('mongoose');

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

exports.getVehicleByCat = async (req, res) => {
    try {
        const { categoria } = req.params;
        const vehicles = await vehicleModel.getVehicleByCat(categoria);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vehicles', error: error.message });
    }
};

exports.getVehicleById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid vehicle id' });
    }

    try {
        const vehicle = await vehicleModel.getVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vehicle', error: error.message });
    }
};