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
        const newVehicle = await vehicleModel.createVehicle(vehicleData, req.files);
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

exports.getVehicleImage = async (req, res) => {
    const { id } = req.params;
    const imageIndex = req.params.imageIndex === undefined ? 0 : Number(req.params.imageIndex);

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid vehicle id' });
    }
    if (!Number.isInteger(imageIndex) || imageIndex < 0) {
        return res.status(400).json({ message: 'Invalid image index' });
    }

    try {
        const vehicle = await vehicleModel.getVehicleById(id);
        const imageId = vehicle?.imagemIds?.[imageIndex];
        if (!imageId) {
            return res.status(404).json({ message: 'Vehicle image not found' });
        }

        const imageStream = await vehicleModel.getVehicleImageStream(imageId);
        if (!imageStream) {
            return res.status(404).json({ message: 'Vehicle image not found' });
        }

        const fileInfo = await mongoose.connection.db.collection('vehicleImages.files').findOne({ _id: new mongoose.Types.ObjectId(imageId) });
        res.setHeader('Content-Type', fileInfo?.metadata?.contentType || fileInfo?.contentType || 'application/octet-stream');

        imageStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vehicle image', error: error.message });
    }
};

exports.updateVehicle = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid vehicle id' });
    }

    try {
        const vehicleData = req.body;
        const updatedVehicle = await vehicleModel.updateVehicle(id, vehicleData, req.files);
        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error updating vehicle', error: error.message });
    }
};

exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid vehicle id' });
    }
    try {
        const deletedVehicle = await vehicleModel.deleteVehicle(id);
        if (!deletedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
};