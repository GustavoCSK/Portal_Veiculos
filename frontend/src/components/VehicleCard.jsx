import { Link } from 'react-router-dom'
import formatCurrency from '../utils/formatCurrency'

function VehicleCard({ vehicle }) {
    return (
        <Link
            className="vehicleCard"
            to={`/detalhes/${vehicle._id}`}
            aria-label={`Ver detalhes de ${vehicle.nome}`}
        >
            <img className="vehicleImage" src={vehicle.imagens[0]} alt={vehicle.nome} />
            <div className="vehicleDetails">
                <h3>{vehicle.nome}</h3>
                <p className="vehicleDescription">{vehicle.descricao}</p>
                <p className="vehiclePrice">Preço <strong>{formatCurrency(vehicle.preco)}</strong></p>
            </div>
        </Link>
    )
}

export default VehicleCard
