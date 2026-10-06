import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
const API_URL = 'http://localhost:3000/api/vehicles'

async function fetchVehicles(setVehicles) {
    try {
        const response = await axios.get(API_URL)
        setVehicles(response.data)
    } catch (error) {
        console.error('Erro ao buscar veículos:', error)
    }
}

function Cards({ onSelectVehicle }) {
    const [vehicles, setVehicles] = useState([])

    useEffect(() => {
        fetchVehicles(setVehicles)
    }, [])
    return (
        <>
        {
            vehicles.map(vehicle => (
                <button
                    key={vehicle._id}
                    type="button"
                    className="vehicleCard"
                    onClick={() => onSelectVehicle(vehicle)}
                    aria-label={`Ver detalhes de ${vehicle.nome}`}
                >
                    <img className="vehicleImage" src={vehicle.imagem} alt={vehicle.nome} />
                    <div className="vehicleDetails">
                        <h3>{vehicle.nome}</h3>
                        <p className="vehicleDescription">{vehicle.descricao}</p>
                        <p className="vehiclePrice">Preço <strong>R$ {vehicle.preco.toFixed(2)}</strong></p>
                    </div>
                </button>
            ))
        }
        </>
    )
}

export default Cards