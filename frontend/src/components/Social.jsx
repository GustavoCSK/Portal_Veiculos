import { GOOGLE_MAPS_EMBED_URL, WHATSAPP_URL } from '../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'

function Social() {
    return (
        <div>
            <a
                className="wzap wzapLink"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Atendimento via WhatsApp"
            >
                <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" />
                <p>Fale conosco pelo WhatsApp</p>
            </a>
            <div className="map">
                <iframe src={GOOGLE_MAPS_EMBED_URL} title="Localização da Portal Veículos em Canoinhas" width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"></iframe>
            </div>
        </div>
    )
}

export default Social