const assert = require('node:assert/strict');
const http = require('node:http');
const Module = require('node:module');
const { Readable } = require('node:stream');
const { after, before, describe, it } = require('node:test');

const model = {
    getAllVehicles: async () => [],
    createVehicle: async () => ({}),
    getVehicleByCat: async () => [],
    getVehicleById: async () => null,
    getVehicleImageStream: async () => null,
    updateVehicle: async () => null,
    deleteVehicle: async () => null,
};

function stubModule(modulePath, exports) {
    const resolvedPath = require.resolve(modulePath);
    const stub = new Module(resolvedPath);
    stub.filename = resolvedPath;
    stub.loaded = true;
    stub.exports = exports;
    require.cache[resolvedPath] = stub;
}

stubModule('../src/models/vehicleModel', model);

const vehicleController = require('../src/controllers/vehicleController');
const mongoose = require('mongoose');

const authController = {
    Login: async (_req, res) => res.status(200).json({ token: 'test-token' }),
};

function authMiddleware(req, res, next) {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return next();
    }
    if (req.headers.authorization !== 'Bearer test-token') {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

stubModule('../src/controllers/authController', authController);
stubModule('../src/middlewares/authMiddleware', authMiddleware);

const express = require('express');
const router = require('../src/routes/vehicleRoutes');

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        headers: {},
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
        setHeader(name, value) {
            this.headers[name] = value;
        },
    };
}

function invoke(handler, req = {}) {
    const res = responseRecorder();
    return Promise.resolve(handler(req, res)).then(() => res);
}

describe('vehicle controller unit tests', () => {
    it('returns all vehicles and reports model failures', async () => {
        model.getAllVehicles = async () => [{ _id: 'vehicle-1' }];
        const success = await invoke(vehicleController.getAllVehicles);
        assert.equal(success.statusCode, 200);
        assert.deepEqual(success.body, [{ _id: 'vehicle-1' }]);

        model.getAllVehicles = async () => { throw new Error('database unavailable'); };
        const failure = await invoke(vehicleController.getAllVehicles);
        assert.equal(failure.statusCode, 500);
        assert.equal(failure.body.message, 'Error retrieving vehicles');
    });

    it('creates a vehicle with its submitted fields and multiple images', async () => {
        const vehicleData = { nome: 'Honda Civic' };
        const image = { originalname: 'civic.jpg' };
        const images = [image, { originalname: 'civic-interior.jpg' }];
        model.createVehicle = async (data, files) => ({ ...data, uploaded: files });

        const res = await invoke(vehicleController.createVehicle, {
            body: vehicleData,
            files: images,
        });

        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, { nome: 'Honda Civic', uploaded: images });

        model.createVehicle = async () => { throw new Error('database unavailable'); };
        const failure = await invoke(vehicleController.createVehicle, { body: vehicleData });
        assert.equal(failure.statusCode, 500);
    });

    it('filters vehicles by category and reports lookup failures', async () => {
        model.getVehicleByCat = async category => [{ categoria: category }];
        const success = await invoke(vehicleController.getVehicleByCat, {
            params: { categoria: 'SUV' },
        });
        assert.deepEqual(success.body, [{ categoria: 'SUV' }]);

        model.getVehicleByCat = async () => { throw new Error('database unavailable'); };
        const failure = await invoke(vehicleController.getVehicleByCat, {
            params: { categoria: 'SUV' },
        });
        assert.equal(failure.statusCode, 500);
    });

    it('validates vehicle IDs and handles found, missing, and failed lookups', async () => {
        let called = false;
        model.getVehicleById = async id => {
            called = true;
            return { _id: id };
        };

        const invalid = await invoke(vehicleController.getVehicleById, {
            params: { id: 'invalid' },
        });

        assert.equal(invalid.statusCode, 400);
        assert.equal(called, false);

        const id = '507f1f77bcf86cd799439011';
        const found = await invoke(vehicleController.getVehicleById, { params: { id } });
        assert.equal(found.statusCode, 200);
        assert.equal(found.body._id, id);

        model.getVehicleById = async () => null;
        const missing = await invoke(vehicleController.getVehicleById, { params: { id } });
        assert.equal(missing.statusCode, 404);

        model.getVehicleById = async () => { throw new Error('database unavailable'); };
        const failed = await invoke(vehicleController.getVehicleById, { params: { id } });
        assert.equal(failed.statusCode, 500);
    });

    it('updates vehicle fields and forwards multiple uploaded images', async () => {
        const id = '507f1f77bcf86cd799439011';
        const files = [{ originalname: 'front.jpg' }, { originalname: 'side.jpg' }];
        let receivedFiles;
        model.updateVehicle = async (vehicleId, data, uploadedFiles) => {
            receivedFiles = uploadedFiles;
            return { _id: vehicleId, ...data, imageCount: uploadedFiles.length };
        };

        const response = await invoke(vehicleController.updateVehicle, {
            params: { id },
            body: { nome: 'Updated car' },
            files,
        });

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.imageCount, 2);
        assert.deepEqual(receivedFiles, files);
    });

    it('serves images, sets the stored content type, and handles absent images', async () => {
        const id = '507f1f77bcf86cd799439011';
        const imageId = '507f1f77bcf86cd799439012';
        let streamed = false;
        model.getVehicleById = async () => ({ imagemIds: [imageId] });
        model.getVehicleImageStream = async () => ({
            pipe(res) {
                streamed = true;
                res.body = 'image bytes';
            },
        });
        mongoose.connection.db = {
            collection: () => ({
                findOne: async () => ({ metadata: { contentType: 'image/jpeg' } }),
            }),
        };

        const res = await invoke(vehicleController.getVehicleImage, { params: { id } });
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['Content-Type'], 'image/jpeg');
        assert.equal(streamed, true);

        const invalid = await invoke(vehicleController.getVehicleImage, {
            params: { id: 'invalid' },
        });
        assert.equal(invalid.statusCode, 400);

        model.getVehicleById = async () => null;
        const missingVehicle = await invoke(vehicleController.getVehicleImage, { params: { id } });
        assert.equal(missingVehicle.statusCode, 404);

        model.getVehicleById = async () => ({ imagemIds: [] });
        const missing = await invoke(vehicleController.getVehicleImage, { params: { id } });
        assert.equal(missing.statusCode, 404);

        model.getVehicleById = async () => ({ imagemIds: [imageId] });
        model.getVehicleImageStream = async () => null;
        const missingStream = await invoke(vehicleController.getVehicleImage, { params: { id } });
        assert.equal(missingStream.statusCode, 404);

        model.getVehicleById = async () => { throw new Error('database unavailable'); };
        const failed = await invoke(vehicleController.getVehicleImage, { params: { id } });
        assert.equal(failed.statusCode, 500);
    });
});

describe('vehicle HTTP integration', () => {
    let server;
    let baseUrl;

    before(async () => {
        const app = express();
        app.use(express.json());
        app.use('/api', router);
        app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found' }));
        server = http.createServer(app);
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        baseUrl = `http://127.0.0.1:${server.address().port}/api`;
    });

    after(async () => {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close(error => error ? reject(error) : resolve());
            });
        }
    });

    it('serves the public list and category endpoints', async () => {
        model.getAllVehicles = async () => [{ nome: 'Honda Civic' }];
        model.getVehicleByCat = async category => [{ categoria: category }];

        const all = await fetch(`${baseUrl}/vehicles`);
        assert.equal(all.status, 200);
        assert.deepEqual(await all.json(), [{ nome: 'Honda Civic' }]);

        const category = await fetch(`${baseUrl}/vehicles/categoria/SUV`);
        assert.equal(category.status, 200);
        assert.deepEqual(await category.json(), [{ categoria: 'SUV' }]);
    });

    it('serves vehicle details and rejects invalid IDs', async () => {
        const id = '507f1f77bcf86cd799439011';
        model.getVehicleById = async requestedId => ({ _id: requestedId, nome: 'Honda Civic' });

        const detail = await fetch(`${baseUrl}/vehicles/${id}`);
        assert.equal(detail.status, 200);
        assert.equal((await detail.json()).nome, 'Honda Civic');

        const invalid = await fetch(`${baseUrl}/vehicles/not-an-object-id`);
        assert.equal(invalid.status, 400);
        assert.equal((await invalid.json()).message, 'Invalid vehicle id');
    });

    it('serves the vehicle image with its content type', async () => {
        const id = '507f1f77bcf86cd799439011';
        const imageId = '507f1f77bcf86cd799439012';
        model.getVehicleById = async () => ({ imagemIds: [imageId] });
        model.getVehicleImageStream = async () => Readable.from([Buffer.from('image bytes')]);
        mongoose.connection.db = {
            collection: () => ({
                findOne: async () => ({ metadata: { contentType: 'image/png' } }),
            }),
        };

        const response = await fetch(`${baseUrl}/vehicles/${id}/imagens/0`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('content-type'), 'image/png');
        assert.equal(await response.text(), 'image bytes');

        const legacyRoute = await fetch(`${baseUrl}/vehicles/${id}/imagem`);
        assert.equal(legacyRoute.status, 401);
    });

    it('serves an indexed vehicle image', async () => {
        const id = '507f1f77bcf86cd799439011';
        const imageIds = ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'];
        let streamedImageId;
        model.getVehicleById = async () => ({ imagemIds: imageIds });
        model.getVehicleImageStream = async imageId => {
            streamedImageId = imageId;
            return Readable.from([Buffer.from('second image')]);
        };
        mongoose.connection.db = {
            collection: () => ({
                findOne: async () => ({ metadata: { contentType: 'image/jpeg' } }),
            }),
        };

        const response = await fetch(`${baseUrl}/vehicles/${id}/imagens/1`);
        assert.equal(response.status, 200, await response.clone().text());
        assert.equal(streamedImageId, imageIds[1]);
        assert.equal(await response.text(), 'second image');

        const invalidIndex = await fetch(`${baseUrl}/vehicles/${id}/imagens/not-an-index`);
        assert.equal(invalidIndex.status, 400);
    });

    it('requires authentication to create vehicles and accepts authenticated requests', async () => {
        const unauthenticated = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: 'Honda Civic' }),
        });
        assert.equal(unauthenticated.status, 401);

        model.createVehicle = async data => data;
        const created = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer test-token',
            },
            body: JSON.stringify({ nome: 'Honda Civic' }),
        });
        assert.equal(created.status, 201);
        assert.deepEqual(await created.json(), { nome: 'Honda Civic' });

        const formData = new FormData();
        formData.append('nome', 'Honda Civic');
        formData.append('imagens', new Blob(['front image']), 'front.jpg');
        formData.append('imagens', new Blob(['side image']), 'side.jpg');
        const unauthenticatedUpload = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            body: formData,
        });
        assert.equal(unauthenticatedUpload.status, 401);

        let uploadedFiles;
        model.createVehicle = async (data, files) => {
            uploadedFiles = files;
            return { nome: data.nome, imageCount: files.length };
        };
        const createdWithImages = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            headers: { Authorization: 'Bearer test-token' },
            body: formData,
        });
        assert.equal(createdWithImages.status, 201, await createdWithImages.clone().text());
        assert.equal((await createdWithImages.json()).imageCount, 2);
        assert.deepEqual(uploadedFiles.map(file => file.originalname), ['front.jpg', 'side.jpg']);
    });

    it('returns the login route and a JSON API 404 for unknown paths', async () => {
        const login = await fetch(`${baseUrl}/login`, { method: 'POST' });
        assert.equal(login.status, 200);
        assert.deepEqual(await login.json(), { token: 'test-token' });

        const missing = await fetch(`${baseUrl}/unknown`, {
            headers: { Authorization: 'Bearer test-token' },
        });
        assert.equal(missing.status, 404);
        assert.deepEqual(await missing.json(), { message: 'API route not found' });
    });
});
