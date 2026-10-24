import { Link, useParams } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import formatCurrency from '../utils/formatCurrency'
import vehicles from '../data/vehicles'

function DetailedView({ theme, onToggleTheme }) {
    const { id } = useParams()
    const vehicle = vehicles.find(item => item._id === id)

    return (
        <div className="homePage">
            <Header theme={theme} onToggleTheme={onToggleTheme} />
            <main className="detailPage">
                <div className="detailContent">
                    <Link className="detailBack" to="/">
                        <span aria-hidden="true">←</span> Voltar ao estoque
                    </Link>
                    {!vehicle && <p role="alert">Não foi possível encontrar este veículo.</p>}
                    {vehicle && (
                        <section className="detailLayout" aria-labelledby="detail-title">
                            <img className="detailImage" src={vehicle.imagem} alt={vehicle.nome} />
                            <div className="detailCopy">
                                <p className="eyebrow">Veículo em destaque</p>
                                <h1 id="detail-title">{vehicle.nome}</h1>
                                <p className="detailDescription">{vehicle.descricao}</p>
                                <p className="detailPriceLabel">Preço</p>
                                <p className="detailPrice">{formatCurrency(vehicle.preco)}</p>
                                <a className="detailContact" href="https://wa.me/5547992054050" target="_blank" rel="noreferrer">Falar com a equipe <span aria-hidden="true">↗</span></a>
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default DetailedView