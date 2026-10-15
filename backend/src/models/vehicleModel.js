const mongoose = require('mongoose');
const { connectDBUser } = require('../config/db');
const vehicleSchema = require('../config/vehicleSchema');

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

function getGridFSBucket() {
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('MongoDB connection not initialized');
    }

    return new mongoose.mongo.GridFSBucket(db, { bucketName: 'vehicleImages' });
}

function serializeVehicle(vehicle) {
    if (!vehicle) {
        return null;
    }

    const plainVehicle = vehicle.toObject ? vehicle.toObject() : { ...vehicle };

    if (plainVehicle.imagemId) {
        plainVehicle.imagem = `http://localhost:3000/api/vehicles/${plainVehicle._id}/imagem`;
    } else {
        plainVehicle.imagem = '';
    }

    return plainVehicle;
}

async function storeVehicleImage(file) {
    if (!file) {
        return null;
    }

    const bucket = getGridFSBucket();

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalname, {
            metadata: { contentType: file.mimetype || 'application/octet-stream' },
        });

        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.end(file.buffer);
    });
}

async function createVehicle(vehicleData, file) {
    await connectDBUser();

    const imageId = await storeVehicleImage(file);
    if (imageId) {
        vehicleData.imagemId = imageId;
        vehicleData.imagemNome = file.originalname;
    }

    const createdVehicle = await Vehicle.create(vehicleData);
    return serializeVehicle(createdVehicle);
}

async function getAllVehicles() {
    await connectDBUser();
    const vehicles = await Vehicle.find({}).lean();
    return vehicles.map(serializeVehicle);
}

async function getVehicleById(id) {
    await connectDBUser();
    const vehicle = await Vehicle.findById(id).lean();
    return serializeVehicle(vehicle);
}

async function getVehicleByCat(categoria) {
    await connectDBUser();
    const vehicles = await Vehicle.find({ categoria }).lean();
    return vehicles.map(serializeVehicle);
}

async function getVehicleImageStream(imageId) {
    if (!imageId) {
        return null;
    }

    const bucket = getGridFSBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(imageId));
}

module.exports = {
    Vehicle,
    createVehicle,
    getAllVehicles,
    getVehicleById,
    getVehicleByCat,
    getVehicleImageStream,
};