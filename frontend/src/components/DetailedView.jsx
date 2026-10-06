import Header from './Header'
import Footer from './Footer'

function DetailedView({ vehicle, onBack }) {
    return (
        <div className="homePage">
            <Header />
            <main className="detailPage">
                <div className="detailContent">
                    <button className="detailBack" type="button" onClick={onBack}>
                        <span aria-hidden="true">←</span> Voltar ao estoque
                    </button>
                    <section className="detailLayout" aria-labelledby="detail-title">
                        <img className="detailImage" src={vehicle.imagem} alt={vehicle.nome} />
                        <div className="detailCopy">
                            <p className="eyebrow">Veículo em destaque</p>
                            <h1 id="detail-title">{vehicle.nome}</h1>
                            <p className="detailDescription">{vehicle.descricao}</p>
                            <p className="detailPriceLabel">Preço</p>
                            <p className="detailPrice">R$ {vehicle.preco.toFixed(2)}</p>
                            <a className="detailContact" href="tel:+5547999864050">Falar com a equipe <span aria-hidden="true">↗</span></a>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default DetailedView