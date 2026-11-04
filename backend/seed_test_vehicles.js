const mongoose = require('mongoose');
const { connectDBUser } = require('./src/config/db');
const { Vehicle } = require('./src/models/vehicleModel');

const testVehicles = [
    {
        nome: 'Hatch de teste',
        marca: 'Portal Teste',
        ano: 2022,
        categoria: 'hatch',
        descricao: 'Veiculo de teste para a categoria hatch.',
        preco: 72900,
        imageUrls: [
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=85',
        ],
    },
    {
        nome: 'SUV de teste',
        marca: 'Portal Teste',
        ano: 2023,
        categoria: 'suv',
        descricao: 'Veiculo de teste para a categoria SUV.',
        preco: 128900,
        imageUrls: [
            'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=85',
        ],
    },
    {
        nome: 'Pickup de teste',
        marca: 'Portal Teste',
        ano: 2021,
        categoria: 'pickup',
        descricao: 'Veiculo de teste para a categoria pickup.',
        preco: 146500,
        imageUrls: [
            'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=85',
        ],
    },
    {
        nome: 'Sedan de teste',
        marca: 'Portal Teste',
        ano: 2022,
        categoria: 'sedan',
        descricao: 'Veiculo de teste para a categoria sedan.',
        preco: 96900,
        imageUrls: [
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&q=85',
        ],
    },
    {
        nome: 'Crossover de teste',
        marca: 'Portal Teste',
        ano: 2024,
        categoria: 'crossover',
        descricao: 'Veiculo de teste para a categoria crossover.',
        preco: 119900,
        imageUrls: [
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=85',
            'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1400&q=85',
        ],
    },
];

async function downloadVehicleImage(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) {
        throw new Error(`Image download failed with HTTP ${response.status}: ${url}`);
    }

    const contentType = response.headers.get('content-type')?.split(';')[0];
    if (!contentType?.startsWith('image/') || contentType === 'image/svg+xml') {
        throw new Error(`Expected a raster image but received ${contentType || 'an unknown content type'}: ${url}`);
    }

    return { buffer: Buffer.from(await response.arrayBuffer()), contentType };
}

async function getVehicleImageId(db, vehicle, url, index) {
    const photoId = new URL(url).pathname.split('/').pop();
    const filename = `test-${vehicle.categoria}-${index + 1}-${photoId}.jpg`;
    const files = db.collection('vehicleImages.files');
    const existingFile = await files.findOne({ filename, 'metadata.sourceUrl': url });
    if (existingFile) {
        return existingFile._id;
    }

    const { buffer, contentType } = await downloadVehicleImage(url);
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'vehicleImages' });
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                contentType,
                sourceUrl: url,
                license: 'Unsplash License',
            },
        });
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.end(buffer);
    });
}

async function main() {
    let connection;

    try {
        connection = await connectDBUser();

        for (const vehicle of testVehicles) {
            const { imageUrls, ...vehicleData } = vehicle;
            const images = await Promise.all(
                imageUrls.map(async (url, index) => ({
                    id: await getVehicleImageId(connection.db, vehicle, url, index),
                    filename: `test-${vehicle.categoria}-${index + 1}-${new URL(url).pathname.split('/').pop()}.jpg`,
                })),
            );
            await Vehicle.updateOne(
                { nome: vehicleData.nome, marca: vehicleData.marca },
                {
                    $set: {
                        ...vehicleData,
                        imagemIds: images.map(({ id }) => id),
                        imagemNomes: images.map(({ filename }) => filename),
                    },
                },
                { upsert: true },
            );
        }

        console.log(`Seeded ${testVehicles.length} test vehicles with ${testVehicles[0].imageUrls.length} Unsplash images each.`);
    } catch (error) {
        console.error('Test vehicle seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

main();