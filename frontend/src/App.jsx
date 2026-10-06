import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import DetailedView from './components/DetailedView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalhes/:id" element={<DetailedView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
