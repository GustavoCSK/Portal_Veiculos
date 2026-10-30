const mongoose = require('mongoose');
const { connectDBUser } = require('../db/db');
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

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
        throw new Error('Missing API_BASE_URL configuration');
    }

    plainVehicle.imagens = (plainVehicle.imagemIds || []).map((_, index) =>
        `${apiBaseUrl.replace(/\/$/, '')}/vehicles/${plainVehicle._id}/imagens/${index}`,
    );

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

async function createVehicle(vehicleData, files) {
    await connectDBUser();

    const imageIds = [];
    for (const file of files) {
        const imageId = await storeVehicleImage(file);
        if (imageId) {
            imageIds.push(imageId);
        }
    }
    if (imageIds.length) {
        vehicleData.imagemIds = imageIds;
        vehicleData.imagemNomes = files.map(file => file.originalname);
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

async function updateVehicle(id, vehicleData, files) {
    await connectDBUser();

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
        return null;
    }

    const updateData = { ...vehicleData };
    delete updateData.imagemIds;
    delete updateData.imagemNomes;

    if (files?.length) {
        const imageIds = await Promise.all(files.map(storeVehicleImage));
        updateData.imagemIds = imageIds;
        updateData.imagemNomes = files.map(file => file.originalname);
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
    );

    return serializeVehicle(updatedVehicle);
}

async function deleteVehicle(id) {
    await connectDBUser();
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
        throw new Error('Vehicle not found');
    }
    try {
        await Vehicle.deleteOne({ _id: id });
        return true;
    } catch (error) {
        throw new Error('Error deleting vehicle: ' + error.message);
    }
}

module.exports = {
    Vehicle,
    createVehicle,
    getAllVehicles,
    getVehicleById,
    getVehicleByCat,
    getVehicleImageStream,
    updateVehicle,
    deleteVehicle,
};