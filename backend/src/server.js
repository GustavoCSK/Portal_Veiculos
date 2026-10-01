const express = require('express');
const path = require('path');
const vehicleRoutes = require('./routes/vehicleRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const frontendPath = path.join(__dirname, '../../frontend');

app.use(cors());
app.use(express.json());
app.use('/api', vehicleRoutes);
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));