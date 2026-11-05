import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { GOOGLE_MAPS_EMBED_URL, WHATSAPP_URL } from '../config'
import './VehicleSocial.css'

function VehicleSocial({ vehicle }) {
    const [answers, setAnswers] = useState({ troca: 'nao', financiamento: 'nao' })

    if (!vehicle) {
        return null
    }

    const messageParts = [`Olá, estou interessado no veículo ${vehicle.nome}${vehicle.ano ? ` ${vehicle.ano}` : ''}`]

    if (answers.troca === 'sim') {
        messageParts.push('Tenho um veículo para oferecer na troca')
    }

    if (answers.financiamento === 'sim') {
        messageParts.push('Gostaria de financiar')
    }

    const whatsappUrl = new URL(WHATSAPP_URL)
    whatsappUrl.searchParams.set('text', messageParts.join('. '))

    function handleAnswerChange(question, event) {
        setAnswers(current => ({ ...current, [question]: event.target.value }))
    }

    return (
        <section className="vehicleSocial" aria-labelledby="social-title">
            <div className="msgInfo" id="questionario">
                <p>Responda nosso questionário</p>
                <form aria-label="Preferências de atendimento">
                    <fieldset className="socialQuestion">
                        <legend>Tem veículo para oferecer na troca?</legend>
                        <label className="socialOption">
                            <input
                                type="radio"
                                name="troca"
                                value="sim"
                                checked={answers.troca === 'sim'}
                                onChange={event => handleAnswerChange('troca', event)}
                            />
                            Sim
                        </label>
                        <label className="socialOption">
                            <input
                                type="radio"
                                name="troca"
                                value="nao"
                                checked={answers.troca === 'nao'}
                                onChange={event => handleAnswerChange('troca', event)}
                            />
                            Não
                        </label>
                    </fieldset>
                    <fieldset className="socialQuestion">
                        <legend>Tem interesse em financiar?</legend>
                        <label className="socialOption">
                            <input
                                type="radio"
                                name="financiamento"
                                value="sim"
                                checked={answers.financiamento === 'sim'}
                                onChange={event => handleAnswerChange('financiamento', event)}
                            />
                            Sim
                        </label>
                        <label className="socialOption">
                            <input
                                type="radio"
                                name="financiamento"
                                value="nao"
                                checked={answers.financiamento === 'nao'}
                                onChange={event => handleAnswerChange('financiamento', event)}
                            />
                            Não
                        </label>
                    </fieldset>
                </form>
                <div className="wzap">
                    <a href={whatsappUrl.toString()} target="_blank" rel="noopener noreferrer" aria-label="Iniciar conversa pelo WhatsApp">
                        <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" />
                        <span>Conversar</span>
                    </a>
                </div>
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
