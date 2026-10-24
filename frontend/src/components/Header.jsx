import { Link } from 'react-router-dom'

function Header({ theme, onToggleTheme }) {
    return (
        <header className="header">
            <div className="headerInner">
                <Link className="brand" to="/" aria-label="Portal Veículos, início">
                    <span className="brandMark" aria-hidden="true">PV</span>
                    <span className="brandWords">
                        <strong><span>Portal</span><span>Veículos</span></strong>
                        <small>CANOINHAS</small>
                    </span>
                </Link>
                <div className="headerActions">
                    <nav className="headerNav" aria-label="Navegação principal">
                        <Link to="/">Início</Link>
                        <Link to="/#estoque">Estoque</Link>
                    </nav>
                    <button
                        className="themeToggle"
                        type="button"
                        aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                        aria-pressed={theme === 'dark'}
                        onClick={onToggleTheme}
                        title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                    >
                        <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header