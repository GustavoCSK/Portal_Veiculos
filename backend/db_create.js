const mongoose = require("mongoose")
const { connectDBAdmin } = require("./src/config/db")

async function main() {
    await connectDBAdmin()
    try {
        await createCollections()
    } catch (err) {
        console.error("Error in create collections:", err);
    }
    finally {
        await mongoose.connection.close()
    }
}

async function createCollections() {
    try {
        const db = mongoose.connection.db;

        const veiculosSchema = new mongoose.Schema(
            {
                nome: String,
                marca: String,
                ano: Number,
                descricao: String,
                preco: Number,
                categoria: String,
                imagem: String
            });
        
        veiculosSchema.methods.setDetails = function(details) {
            this.nome = details.nome;
            this.marca = details.marca;
            this.ano = details.ano;
            this.descricao = details.descricao;
            this.preco = details.preco;
            this.categoria = details.categoria;
            this.imagem = details.imagem;
        }

        veiculosSchema.methods.getDetails = function() {
            return {
                nome: this.nome,
                marca: this.marca,
                ano: this.ano,
                descricao: this.descricao,
                preco: this.preco,
                categoria: this.categoria,
                imagem: this.imagem
            };
        }

        const veiculos = mongoose.model("veiculos", veiculosSchema);

        await db.createCollection("veiculos", function(err, collection) {
            if (err) {
                console.error("Error creating collection:", err);
            } else {
                console.log("Collection 'veiculos' created successfully.");
            }
        });
    }
    catch (err) {
        console.error("Error creating collections:", err);
    }
}

main()