import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

function Header({ theme, onToggleTheme }) {
    return (
        <header className="header">
            <div className="headerInner">
                <a className="brand" href="/" aria-label="Portal Veículos, início">
                    <span className="brandMark" aria-hidden="true">PV</span>
                    <span className="brandWords">
                        <strong><span>Portal</span><span>Veículos</span></strong>
                        <small>CANOINHAS</small>
                    </span>
                </a>
                <div className="headerActions">
                    <nav className="headerNav" aria-label="Navegação principal">
                        <a href="/">Home</a>
                        <a href="/#sobre">About us</a>
                    </nav>
                    <button
                        className="themeToggle"
                        type="button"
                        aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                        aria-pressed={theme === 'dark'}
                        onClick={onToggleTheme}
                        title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                    >
                        <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header