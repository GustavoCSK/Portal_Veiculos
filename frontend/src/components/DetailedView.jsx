import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import formatCurrency from '../utils/formatCurrency'
import VehicleSocial from './VehicleSocial'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { API_URL, CONTACT_PHONE } from '../config'

function DetailedView({ theme, onToggleTheme }) {
    const { id } = useParams()
    const [vehicle, setVehicle] = useState(null)
    const [selectedImage, setSelectedImage] = useState({ vehicleId: null, index: 0 })
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

    const images = vehicle?.imagens || []
    const selectedImageIndex = selectedImage.vehicleId === vehicle?._id ? selectedImage.index : 0
    const activeImage = images[selectedImageIndex] || images[0]

    return (
        <div className="homePage">
            <Header theme={theme} onToggleTheme={onToggleTheme} />
            <main className="detailPage">
                <div className="detailContent">
                    <Link className="detailBack" to="/">
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Voltar ao estoque
                    </Link>
                    {loading && <p role="status">Carregando veículo...</p>}
                    {error && <p role="alert">Não foi possível encontrar este veículo.</p>}
                    {vehicle && (
                        <section className="detailLayout" aria-labelledby="detail-title">
                            <div className="detailGallery">
                                {activeImage && (
                                    <img className="detailImage" src={activeImage} alt={vehicle.nome} />
                                )}
                                {images.length > 1 && (
                                    <div className="detailThumbnails" aria-label="Imagens do veículo">
                                        {images.map((image, index) => (
                                            <button
                                                className="detailThumbnail"
                                                type="button"
                                                key={image}
                                                aria-label={`Ver imagem ${index + 1} de ${vehicle.nome}`}
                                                aria-pressed={index === selectedImageIndex}
                                                onClick={() => setSelectedImage({ vehicleId: vehicle._id, index })}
                                            >
                                                <img src={image} alt="" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="detailCopy">
                                <p className="eyebrow">Veículo em destaque</p>
                                <h1 id="detail-title">{vehicle.nome}</h1>
                                <p className="detailDescription">{vehicle.descricao}</p>
                                <p className="detailPriceLabel">Preço</p>
                                <p className="detailPrice">{formatCurrency(vehicle.preco)}</p>
                                <a className="detailContact" href={`tel:${CONTACT_PHONE}`}>Falar com a equipe <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" /></a>
                            </div>
                        </section>
                    )}
                </div>
                <VehicleSocial vehicle={vehicle} />
            </main>
            <Footer />
        </div>
    )
}

export default DetailedView