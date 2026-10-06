function Header() {
    return (
        <header className="header">
            <div className="headerInner">
                <a className="brand" href="/" aria-label="Portal Veículos, início">
                    <span className="brandMark" aria-hidden="true">PV</span>
                    <span className="brandWords">
                        <strong>PORTAL</strong>
                        <small>VEÍCULOS · CANOINHAS</small>
                    </span>
                </a>
                <div className="headerContact">
                    <span>Atendimento</span>
                    <a href="tel:+5547999864050">(47) 99986-4050</a>
                </div>
            </div>
        </header>
    )
}

export default Header