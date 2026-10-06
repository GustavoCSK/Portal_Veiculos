const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
	{
		nome: String,
		marca: String,
		ano: Number,
		descricao: String,
		preco: Number,
		categoria: String,
		imagemId: { type: mongoose.Schema.Types.ObjectId, default: null },
		imagemNome: String,
	},
	{ collection: 'veiculos' },
);

module.exports = vehicleSchema;