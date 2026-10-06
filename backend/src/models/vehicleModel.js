const mongoose = require('mongoose');
const { connectDBUser } = require('../config/db');
const vehicleSchema = require('../config/vehicleSchema');

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

async function createVehicle(vehicleData) {
	await connectDBUser();
	return Vehicle.create(vehicleData);
}

async function getAllVehicles() {
    await connectDBUser();
    return Vehicle.find({});
}

async function getVehicleById(id) {
    await connectDBUser();
    return Vehicle.findById(id);
}

async function getVehicleByCat(categoria) {
    await connectDBUser();
    return Vehicle.find({ categoria });
}

module.exports = { Vehicle, createVehicle, getAllVehicles, getVehicleById, getVehicleByCat };