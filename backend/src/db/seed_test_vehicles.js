const mongoose = require('mongoose');
const { connectDBAdmin } = require('./db');
const { Vehicle } = require('../models/vehicleModel');

const PLACEHOLDER_FILENAME = 'test-vehicle-placeholder.svg';
const PLACEHOLDER_IMAGE = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#edf1ed"/>
  <path d="M0 360h800v140H0z" fill="#dce4de"/>
  <path d="M180 322h44l45-91c9-18 24-29 45-29h156c21 0 39 10 51 28l61 92h33c25 0 45 20 45 45v26H135v-39c0-18 16-32 45-32z" fill="#496f61"/>
  <path d="m293 236-39 78h126v-91h-66c-9 0-16 4-21 13zm110-13v91h153l-51-76c-7-10-16-15-29-15z" fill="#dce9e2"/>
  <circle cx="254" cy="389" r="43" fill="#283c35"/>
  <circle cx="254" cy="389" r="19" fill="#e4ebe6"/>
  <circle cx="556" cy="389" r="43" fill="#283c35"/>
  <circle cx="556" cy="389" r="19" fill="#e4ebe6"/>
  <text x="400" y="105" text-anchor="middle" fill="#354c41" font-family="sans-serif" font-size="30" font-weight="700">VEICULO DE TESTE</text>
  <text x="400" y="145" text-anchor="middle" fill="#61756a" font-family="sans-serif" font-size="18">Imagem provisoria</text>
</svg>
`, 'utf8');

const testVehicles = [
    {
        nome: 'Hatch de teste',
        marca: 'Portal Teste',
        ano: 2022,
        categoria: 'hatch',
        descricao: 'Veiculo de teste para a categoria hatch.',
        preco: 72900,
    },
    {
        nome: 'SUV de teste',
        marca: 'Portal Teste',
        ano: 2023,
        categoria: 'suv',
        descricao: 'Veiculo de teste para a categoria SUV.',
        preco: 128900,
    },
    {
        nome: 'Pickup de teste',
        marca: 'Portal Teste',
        ano: 2021,
        categoria: 'pickup',
        descricao: 'Veiculo de teste para a categoria pickup.',
        preco: 146500,
    },
    {
        nome: 'Sedan de teste',
        marca: 'Portal Teste',
        ano: 2022,
        categoria: 'sedan',
        descricao: 'Veiculo de teste para a categoria sedan.',
        preco: 96900,
    },
    {
        nome: 'Crossover de teste',
        marca: 'Portal Teste',
        ano: 2024,
        categoria: 'crossover',
        descricao: 'Veiculo de teste para a categoria crossover.',
        preco: 119900,
    },
];

async function getPlaceholderImageId(db) {
    const files = db.collection('vehicleImages.files');
    const existingFile = await files.findOne({ filename: PLACEHOLDER_FILENAME });
    if (existingFile) {
        await files.updateOne(
            { _id: existingFile._id },
            { $set: { 'metadata.contentType': 'image/svg+xml' } },
        );
        return existingFile._id;
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'vehicleImages' });
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(PLACEHOLDER_FILENAME, {
            metadata: { contentType: 'image/svg+xml' },
        });
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.end(PLACEHOLDER_IMAGE);
    });
}

async function main() {
    let connection;

    try {
        connection = await connectDBAdmin();
        const imageId = await getPlaceholderImageId(connection.db);

        for (const vehicle of testVehicles) {
            await Vehicle.updateOne(
                { nome: vehicle.nome, marca: vehicle.marca },
                { $set: { ...vehicle, imagemIds: [imageId], imagemNomes: [PLACEHOLDER_FILENAME] } },
                { upsert: true },
            );
        }

        console.log(`Seeded ${testVehicles.length} test vehicles across ${new Set(testVehicles.map(({ categoria }) => categoria)).size} categories.`);
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