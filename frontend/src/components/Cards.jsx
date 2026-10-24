import { useState } from 'react'
import { Link } from 'react-router-dom'
import formatCurrency from '../utils/formatCurrency'
import vehicles from '../data/vehicles'

function Cards() {
    const [category, setCategory] = useState('')
    const categories = [...new Set(vehicles.map(vehicle => vehicle.categoria))]
    const visibleVehicles = category
        ? vehicles.filter(vehicle => vehicle.categoria === category)
        : vehicles

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
                visibleVehicles.length > 0 ? visibleVehicles.map(vehicle => (
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