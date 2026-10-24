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
                    <a href="https://wa.me/5547992054050" target="_blank" rel="noreferrer">WhatsApp · (47) 99205-4050</a>
                    <a href="tel:+554736241112">(47) 3624-1112</a>
                </div>
                <a className="loginLink" href="/login">Acesso lojista <span aria-hidden="true">↗</span></a>
            </div>
            <div className="footerBottom">
                <span>© 2026 Portal Veículos</span>
                <span>Canoinhas · Santa Catarina</span>
            </div>
        </footer>
    )
}

export default Footer