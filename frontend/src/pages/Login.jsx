import { useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_TOKEN_KEY, LOGIN_URL } from '../config'

function Login() {
    const location = useLocation()
    const navigate = useNavigate()
    const [usuario, setUsuario] = useState('')
    const [senha, setSenha] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setIsSubmitting(true)
        setErrorMessage('')

        try {
            const response = await axios.post(LOGIN_URL, { username: usuario, password: senha })
            if (!response.data?.token) {
                throw new Error('A resposta de login não incluiu um token de acesso.')
            }
            window.localStorage.setItem(AUTH_TOKEN_KEY, response.data.token)
            navigate(location.state?.from?.pathname || '/admin', { replace: true })
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            setErrorMessage('Não foi possível entrar. Verifique seu usuário e senha.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="loginPage">
            <section className="loginCard" aria-labelledby="login-title">
                <Link className="loginBrand" to="/" aria-label="Portal Veículos, início">
                    <span className="loginBrandMark" aria-hidden="true">PV</span>
                    <span className="loginBrandName"><span>Portal</span> Veículos</span>
                </Link>

                <p className="loginEyebrow">Área do lojista</p>
                <h1 id="login-title">Acesse sua conta</h1>
                <p className="loginDescription">Entre com seu usuário e senha para continuar.</p>

                <form className="loginForm" onSubmit={handleSubmit}>
                    <div className="loginField">
                        <label htmlFor="usuario">Usuário</label>
                        <input
                            id="usuario"
                            name="usuario"
                            type="text"
                            autoComplete="username"
                            value={usuario}
                            onChange={event => setUsuario(event.target.value)}
                            required
                        />
                    </div>
                    <div className="loginField">
                        <label htmlFor="senha">Senha</label>
                        <input
                            id="senha"
                            name="senha"
                            type="password"
                            autoComplete="current-password"
                            value={senha}
                            onChange={event => setSenha(event.target.value)}
                            required
                        />
                    </div>
                    {errorMessage && <p className="loginMessage loginError" role="alert">{errorMessage}</p>}
                    <button className="loginSubmit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <Link className="loginBackLink" to="/">Voltar ao início</Link>
            </section>
        </main>
    )
}

export default Login