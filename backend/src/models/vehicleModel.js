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

module.exports = { Vehicle, createVehicle, getAllVehicles };