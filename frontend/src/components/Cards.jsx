import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import formatCurrency from '../utils/formatCurrency'
const API_URL = 'http://localhost:3000/api/vehicles'

async function fetchVehicles(setVehicles, setCategories) {
    try {
        const response = await axios.get(API_URL)
        setVehicles(response.data)
        setCategories(getCategories(response.data))
    } catch (error) {
        console.error('Erro ao buscar veículos:', error)
    }
}

async function fetchVehiclesByCat(categoria, setVehicles) {
    try {
        const response = await axios.get(`${API_URL}/categoria/${categoria}`)
        setVehicles(response.data)
    } catch (error) {
        console.error('Erro ao buscar veículos por categoria:', error)
    }
}

function getCategories(vehicles) {
    const categories = new Set()
    vehicles.forEach(vehicle => {
        if (vehicle.categoria) {
            categories.add(vehicle.categoria)
        }
    })
    return Array.from(categories)
}


function Cards() {
    const [vehicles, setVehicles] = useState([])
    const [categories, setCategories] = useState([])
    const [category, setCategory] = useState('')

    useEffect(() => {
        if (category) {
            fetchVehiclesByCat(category, setVehicles)
        } else {
            fetchVehicles(setVehicles, setCategories)
        }
    }, [category])

    return (
        <>
            <div className="categoryFilter" role="group" aria-label="Filtrar veículos por categoria">
                <button type="button" aria-pressed={category === ''} onClick={() => setCategory('')}>Todos</button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        aria-pressed={category === cat}
                        onClick={() => setCategory(category === cat ? '' : cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            {
                vehicles.length > 0 ? vehicles.map(vehicle => (
                    <Link
                        key={vehicle._id}
                        className="vehicleCard"
                        to={`/detalhes/${vehicle._id}`}
                        aria-label={`Ver detalhes de ${vehicle.nome}`}
                    >
                        <img className="vehicleImage" src={vehicle.imagem} alt={vehicle.nome} />
                        <div className="vehicleDetails">
                            <h3>{vehicle.nome}</h3>
                            <p className="vehicleDescription">{vehicle.descricao}</p>
                            <p className="vehiclePrice">Preço <strong>{formatCurrency(vehicle.preco)}</strong></p>
                        </div>
                    </Link>
                )) : (
                    <p className="emptyVehicles" role="status">
                        {category
                            ? `Nenhum veículo encontrado na categoria ${category}.`
                            : 'Nenhum veículo cadastrado.'}
                        {category && (
                            <button type="button" onClick={() => setCategory('')}>
                                Ver todos
                            </button>
                        )}
                    </p>
                )
            }
        </>
    )
}

export default Cards