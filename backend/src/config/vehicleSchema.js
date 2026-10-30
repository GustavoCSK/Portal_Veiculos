const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
	{
		nome: String,
		marca: String,
		ano: Number,
		descricao: String,
		preco: Number,
		categoria: String,
		imagemIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
		imagemNomes: { type: [String], default: [] },
	},
	{ collection: 'veiculos' },
);

module.exports = vehicleSchema;