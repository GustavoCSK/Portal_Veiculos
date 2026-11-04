import VehicleCard from './VehicleCard'

function VehicleCardList({ vehicles, category, onClearCategory }) {
    if (vehicles.length === 0) {
        return (
            <p className="emptyVehicles" role="status">
                {category
                    ? `Nenhum veículo encontrado na categoria ${category}.`
                    : 'Nenhum veículo cadastrado.'}
                {category && (
                    <button type="button" onClick={onClearCategory}>
                        Ver todos
                    </button>
                )}
            </p>
        )
    }

    return vehicles.map(vehicle => (
        <VehicleCard key={vehicle._id} vehicle={vehicle} />
    ))
}

export default VehicleCardList
