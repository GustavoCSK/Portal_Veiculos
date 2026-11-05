import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import {
    CONTACT_PHONE,
    CONTACT_PHONE_DISPLAY,
    SECONDARY_PHONE,
    SECONDARY_PHONE_DISPLAY,
} from '../config'
import './Footer.css'

function Footer() {
    return (
        <footer className="footer" id="sobre">
            <div className="footerInner">
                <div className="footerBrand">
                    <strong>Portal <span>Veículos</span></strong>
                    <p>Negócios seguros. Novos caminhos.</p>
                </div>
                <div className="footerColumn">
                    <span className="footerLabel">Visite</span>
                    <address>Rua Caetano Costa, 1151<br />Centro · Canoinhas, SC</address>
                </div>
                <div className="footerColumn">
                    <span className="footerLabel">Fale com a gente</span>
                    <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE_DISPLAY}</a>
                    <a href={`tel:${SECONDARY_PHONE}`}>{SECONDARY_PHONE_DISPLAY}</a>
                </div>
                <Link className="loginLink" to="/login">Painel lojista <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" /></Link>
            </div>
            <div className="footerBottom">
                <span>© 2026 Portal Veículos</span>
                <span>Canoinhas · Santa Catarina</span>
            </div>
        </footer>
    )
}

export default Footer