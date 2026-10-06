import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const API_URL = 'http://localhost:3000/api/vehicles'

function DetailedView() {
    const { id } = useParams()
    const [vehicle, setVehicle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false

        setVehicle(null)
        setError(false)
        setLoading(true)

        axios.get(`${API_URL}/${id}`)
            .then((response) => {
                if (!cancelled) setVehicle(response.data)
            })
            .catch((requestError) => {
                console.error('Erro ao buscar veículo:', requestError)
                if (!cancelled) setError(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [id])

    return (
        <div className="homePage">
            <Header />
            <main className="detailPage">
                <div className="detailContent">
                    <Link className="detailBack" to="/">
                        <span aria-hidden="true">←</span> Voltar ao estoque
                    </Link>
                    {loading && <p role="status">Carregando veículo...</p>}
                    {error && <p role="alert">Não foi possível encontrar este veículo.</p>}
                    {vehicle && (
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
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default DetailedView