const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const vehicleRoutes = require('./routes/vehicleRoutes');
const cors = require('cors');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const frontendPath = path.join(__dirname, '../../frontend/dist');

app.use(cors());
app.use(express.json());
app.use('/api', vehicleRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));
app.use(express.static(frontendPath));

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT;
if (!PORT) {
    throw new Error('Missing PORT configuration');
}
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));