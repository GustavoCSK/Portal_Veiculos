const mongoose = require('mongoose');
const { connectDBAdmin } = require('./src/config/db');
const { Vehicle } = require('./src/models/vehicleModel');

async function main() {
    let connection;

    try {
        connection = await connectDBAdmin();
        const db = connection.db;
        const collectionExists = await db
            .listCollections({ name: Vehicle.collection.name }, { nameOnly: true })
            .hasNext();

        if (!collectionExists) {
            await Vehicle.createCollection();
            new mongoose.mongo.GridFSBucket(db, { bucketName: 'vehicleImages' });
            console.log("Collection 'veiculos' created successfully.");
        } else {
            console.log("Collection 'veiculos' already exists.");
        }
    } catch (err) {
        console.error('Database setup failed:', err.message);
        process.exitCode = 1;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

main();