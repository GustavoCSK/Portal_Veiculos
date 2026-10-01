const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
	{
		id: Number,
		nome: String,
		marca: String,
		ano: Number,
		descricao: String,
		preco: Number,
		categoria: String,
		imagem: String,
	},
	{ collection: 'veiculos' },
);

module.exports = vehicleSchema;