const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const Module = require('node:module');
const { after, describe, it } = require('node:test');
const mongoose = require('mongoose');

const dbPath = require.resolve('../src/db/db');
const dbStub = new Module(dbPath);
dbStub.filename = dbPath;
dbStub.loaded = true;
dbStub.exports = { connectDBUser: async () => {} };
require.cache[dbPath] = dbStub;

const vehicleModel = require('../src/models/vehicleModel');
const { Vehicle } = vehicleModel;
const originalFindById = Vehicle.findById;
const originalFindByIdAndUpdate = Vehicle.findByIdAndUpdate;
const originalBucketDescriptor = Object.getOwnPropertyDescriptor(mongoose.mongo, 'GridFSBucket');
const originalDb = mongoose.connection.db;
const originalApiBaseUrl = process.env.API_BASE_URL;
const uploadedFiles = [];
const bucketDescriptor = {
    configurable: true,
    value: class {
        openUploadStream(filename) {
            const stream = new EventEmitter();
            stream.id = new mongoose.Types.ObjectId();
            stream.end = buffer => {
                uploadedFiles.push({ filename, buffer });
                setImmediate(() => stream.emit('finish'));
            };
            return stream;
        }
    },
};

Object.defineProperty(mongoose.mongo, 'GridFSBucket', bucketDescriptor);
mongoose.connection.db = {};
process.env.API_BASE_URL = 'http://api.test/api';

after(() => {
    Vehicle.findById = originalFindById;
    Vehicle.findByIdAndUpdate = originalFindByIdAndUpdate;
    Object.defineProperty(mongoose.mongo, 'GridFSBucket', originalBucketDescriptor);
    mongoose.connection.db = originalDb;
    if (originalApiBaseUrl === undefined) {
        delete process.env.API_BASE_URL;
    } else {
        process.env.API_BASE_URL = originalApiBaseUrl;
    }
});

describe('vehicle model updates', () => {
    it('updates vehicle fields without changing images when no files are submitted', async () => {
        const id = new mongoose.Types.ObjectId();
        let update;
        Vehicle.findById = async () => ({ _id: id });
        Vehicle.findByIdAndUpdate = async (_id, updateData) => {
            update = updateData.$set;
            return { _id, ...update };
        };

        const result = await vehicleModel.updateVehicle(id, {
            nome: 'Updated name',
            imagemIds: ['client-provided-id'],
            imagemNomes: ['client-provided-name'],
        });

        assert.equal(result.nome, 'Updated name');
        assert.equal('imagemIds' in update, false);
        assert.equal('imagemNomes' in update, false);
    });

    it('replaces all image references when new images are uploaded', async () => {
        const id = new mongoose.Types.ObjectId();
        let update;
        uploadedFiles.length = 0;
        Vehicle.findById = async () => ({ _id: id, imagemIds: [new mongoose.Types.ObjectId()] });
        Vehicle.findByIdAndUpdate = async (_id, updateData) => {
            update = updateData.$set;
            return { _id, ...update };
        };

        const files = [
            { originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('front') },
            { originalname: 'side.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('side') },
        ];
        const result = await vehicleModel.updateVehicle(id, { nome: 'Updated name' }, files);

        assert.equal(update.imagemIds.length, 2);
        assert.equal(update.imagemNomes.join(','), 'front.jpg,side.jpg');
        assert.deepEqual(uploadedFiles.map(file => file.filename), ['front.jpg', 'side.jpg']);
        assert.deepEqual(
            result.imagens,
            update.imagemIds.map((_, index) =>
                `http://api.test/api/vehicles/${id}/imagens/${index}`,
            ),
        );
    });

    it('returns null when the vehicle does not exist', async () => {
        Vehicle.findById = async () => null;
        Vehicle.findByIdAndUpdate = async () => {
            assert.fail('Should not update a missing vehicle');
        };

        assert.equal(await vehicleModel.updateVehicle(new mongoose.Types.ObjectId(), {}), null);
    });
});
