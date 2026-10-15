import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import DetailedView from './components/DetailedView'

function App() {
  const [theme, setTheme] = useState(() => (
    window.localStorage.getItem('portal-veiculos-theme') === 'dark' ? 'dark' : 'light'
  ))

  useEffect(() => {
    window.localStorage.setItem('portal-veiculos-theme', theme)
  }, [theme])

  return (
    <div className="appShell" data-theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />} />
          <Route path="/detalhes/:id" element={<DetailedView theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
