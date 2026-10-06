import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import DetailedView from './components/DetailedView'

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  return (
    selectedVehicle
      ? <DetailedView vehicle={selectedVehicle} onBack={() => setSelectedVehicle(null)} />
      : <Home onSelectVehicle={setSelectedVehicle} />
  )
}

export default App
