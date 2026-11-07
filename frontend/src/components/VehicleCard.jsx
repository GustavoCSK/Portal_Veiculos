import { Link } from 'react-router-dom'
import formatCurrency from '../utils/formatCurrency'
import './VehicleCard.css'

function VehicleCard({ vehicle }) {
    return (
        <Link
            className="vehicleCard"
            to={`/detalhes/${vehicle._id}`}
            aria-label={`Ver detalhes de ${vehicle.nome}${vehicle.ano ? `, ${vehicle.ano}` : ''}`}
        >
            <img className="vehicleImage" src={vehicle.imagens[0]} alt={`${vehicle.nome}${vehicle.ano ? `, ${vehicle.ano}` : ''}`} />
            <div className="vehicleDetails">
                <h3 className="vehicleTitle">
                    <span>{vehicle.nome}</span>
                    {vehicle.ano && <span className="vehicleYear">{vehicle.ano}</span>}
                </h3>
                <p className="vehicleDescription">{vehicle.descricao}</p>
                <p className="vehiclePrice">Preço <strong>{formatCurrency(vehicle.preco)}</strong></p>
            </div>
        </Link>
    )
}

export default VehicleCard
