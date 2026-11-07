import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import formatCurrency from '../utils/formatCurrency'
import VehicleSocial from './VehicleSocial'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft,
    faArrowUpRightFromSquare,
    faChevronLeft,
    faChevronRight,
    faCompress,
    faExpand,
} from '@fortawesome/free-solid-svg-icons'
import { API_URL } from '../config'
import './DetailedView.css'

function DetailedView({ theme, onToggleTheme }) {
    const { id } = useParams()
    const [request, setRequest] = useState({ id: null, vehicle: null, loading: true, error: false })
    const [selectedImage, setSelectedImage] = useState({ vehicleId: null, index: 0 })
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        let cancelled = false

        axios.get(`${API_URL}/${id}`)
            .then((response) => {
                if (!cancelled) setRequest({ id, vehicle: response.data, loading: false, error: false })
            })
            .catch((requestError) => {
                console.error('Erro ao buscar veículo:', requestError)
                if (!cancelled) setRequest({ id, vehicle: null, loading: false, error: true })
            })

        return () => {
            cancelled = true
        }
    }, [id])

    useEffect(() => {
        if (!isFullscreen) return undefined

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        function handleKeyDown(event) {
            if (event.key === 'Escape') setIsFullscreen(false)
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isFullscreen])

    const hasCurrentRequest = request.id === id
    const vehicle = hasCurrentRequest ? request.vehicle : null
    const loading = !hasCurrentRequest || request.loading
    const error = hasCurrentRequest && request.error
    const images = vehicle?.imagens || []
    const selectedImageIndex = selectedImage.vehicleId === vehicle?._id ? selectedImage.index : 0
    const activeImage = images[selectedImageIndex] || images[0]
    const vehicleTitle = `${vehicle?.nome || ''}${vehicle?.ano ? `, ${vehicle.ano}` : ''}`

    function moveImage(direction) {
        if (!vehicle || images.length < 2) return

        const nextIndex = (selectedImageIndex + direction + images.length) % images.length
        setSelectedImage({ vehicleId: vehicle._id, index: nextIndex })
    }

    function toggleFullscreen() {
        setIsFullscreen((fullscreen) => !fullscreen)
    }

    return (
        <div className="homePage">
            <Header theme={theme} onToggleTheme={onToggleTheme} />
            <main className="detailPage">
                <div className="detailContent">
                    <Link className="detailBack" to="/" aria-label="Voltar ao estoque">
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Voltar ao estoque
                    </Link>
                    {loading && <p role="status">Carregando veículo...</p>}
                    {error && <p role="alert">Não foi possível encontrar este veículo.</p>}
                    {vehicle && (
                        <section className="detailLayout" aria-labelledby="detail-title">
                            <div
                                className={`detailGallery${isFullscreen ? ' detailGalleryFullscreen' : ''}`}
                                role={isFullscreen ? 'dialog' : undefined}
                                aria-modal={isFullscreen ? 'true' : undefined}
                                aria-label={isFullscreen ? `Galeria de imagens de ${vehicleTitle}` : undefined}
                            >
                                {activeImage && (
                                    <div className="detailImageFrame">
                                        <img className="detailImage" src={activeImage} alt={vehicleTitle} />
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    className="galleryControl galleryPrevious"
                                                    type="button"
                                                    aria-label={`Imagem anterior de ${vehicleTitle}`}
                                                    onClick={() => moveImage(-1)}
                                                >
                                                    <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
                                                </button>
                                                <button
                                                    className="galleryControl galleryNext"
                                                    type="button"
                                                    aria-label={`Próxima imagem de ${vehicleTitle}`}
                                                    onClick={() => moveImage(1)}
                                                >
                                                    <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            className="galleryControl galleryFullscreenToggle"
                                            type="button"
                                            aria-label={isFullscreen ? 'Fechar tela cheia' : `Expandir imagem de ${vehicleTitle}`}
                                            onClick={toggleFullscreen}
                                        >
                                            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} aria-hidden="true" />
                                        </button>
                                    </div>
                                )}
                                {images.length > 1 && (
                                    <div className="detailThumbnails" aria-label="Imagens do veículo">
                                        {images.map((image, index) => (
                                            <button
                                                className="detailThumbnail"
                                                type="button"
                                                key={image}
                                                aria-label={`Ver imagem ${index + 1} de ${vehicleTitle}`}
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
                                <h1 id="detail-title" className="vehicleTitle" aria-label={vehicleTitle}>
                                    <span>{vehicle.nome}</span>
                                    {vehicle.ano && <span className="vehicleYear">{vehicle.ano}</span>}
                                </h1>
                                <p className="detailDescription">{vehicle.descricao}</p>
                                <div className="detailPriceCard">
                                    <p className="detailPriceLabel">Preço</p>
                                    <p className="detailPrice">{formatCurrency(vehicle.preco)}</p>
                                </div>
                                <a className="detailContact" href="#questionario">Falar com a equipe <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" /></a>
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