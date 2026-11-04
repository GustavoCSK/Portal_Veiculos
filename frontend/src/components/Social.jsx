import { GOOGLE_MAPS_EMBED_URL, WHATSAPP_URL } from '../config'

function Social() {
    return (
        <div>
            <div className='wzap'>
                <p>Atendimento via WhatsApp</p>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <img src="/images/whatsapp-icon.png" alt="WhatsApp" />
                </a>
            </div>
            <div className="map">
                <iframe src={GOOGLE_MAPS_EMBED_URL} width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"></iframe>
            </div>
        </div>
    )
}

export default Social