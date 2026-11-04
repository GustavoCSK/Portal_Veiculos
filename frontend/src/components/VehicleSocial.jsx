import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { GOOGLE_MAPS_EMBED_URL, WHATSAPP_URL } from '../config'

function VehicleSocial({ vehicle }) {
    const [interests, setInterests] = useState([])

    if (!vehicle) {
        return null
    }

    const messageParts = [`Olá, estou interessado no veículo ${vehicle.nome}`]

    if (interests.includes('troca')) {
        messageParts.push('Tenho um veículo para oferecer na troca')
    }

    if (interests.includes('financiamento')) {
        messageParts.push('Gostaria de financiar')
    }

    const whatsappUrl = new URL(WHATSAPP_URL)
    whatsappUrl.searchParams.set('text', messageParts.join('. '))

    function handleInterestChange(event) {
        const { checked, value } = event.target
        setInterests(current => (
            checked
                ? [...current, value]
                : current.filter(interest => interest !== value)
        ))
    }

    return (
        <section className="vehicleSocial" aria-labelledby="social-title">
            <div className="socialIntro">
                <p className="eyebrow">Estamos por perto</p>
                <h2 id="social-title">Entre em contato conosco</h2>
                <p>Converse com nossa equipe ou venha nos visitar em Canoinhas.</p>
            </div>
            <div className="msgInfo">
                <p>O que você procura?</p>
                <form aria-label="Preferências de atendimento">
                    <label className="socialOption" htmlFor="trocaBox">
                        <input
                            type="checkbox"
                            name="interests"
                            value="troca"
                            id="trocaBox"
                            checked={interests.includes('troca')}
                            onChange={handleInterestChange}
                        />
                        Tenho veículo para troca
                    </label>
                    <label className="socialOption" htmlFor="financiarBox">
                        <input
                            type="checkbox"
                            name="interests"
                            value="financiamento"
                            id="financiarBox"
                            checked={interests.includes('financiamento')}
                            onChange={handleInterestChange}
                        />
                        Tenho interesse em financiar
                    </label>
                </form>
            </div>
            <div className="wzap">
                <div>
                    <p>Fale com a gente</p>
                    <span>Atendimento direto pelo WhatsApp</span>
                </div>
                <a href={whatsappUrl.toString()} target="_blank" rel="noopener noreferrer" aria-label="Iniciar conversa pelo WhatsApp">
                    <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" />
                    <span>Conversar</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
                </a>
            </div>
            <div className="map">
                <h3>Mapa com localização</h3>
                <iframe
                    src={GOOGLE_MAPS_EMBED_URL}
                    title="Localização da Portal Veículos em Canoinhas"
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        </section>
    )
}

export default VehicleSocial
