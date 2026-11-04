import { useEffect, useState } from 'react'
import axios from 'axios'
import CategoryFilter from './CategoryFilter'
import VehicleCardList from './VehicleCardList'
import { API_URL } from '../config'

async function fetchVehicles(setVehicles, setCategories) {
    try {
        const response = await axios.get(API_URL)
        setVehicles(response.data)
        setCategories(getCategories(response.data))
    } catch (error) {
        console.error('Erro ao buscar veículos:', error)
    }
}

async function fetchVehiclesByCategory(category, setVehicles) {
    try {
        const response = await axios.get(`${API_URL}/categoria/${category}`)
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

function Products() {
    const [vehicles, setVehicles] = useState([])
    const [categories, setCategories] = useState([])
    const [category, setCategory] = useState('')

    useEffect(() => {
        if (category) {
            fetchVehiclesByCategory(category, setVehicles)
        } else {
            fetchVehicles(setVehicles, setCategories)
        }
    }, [category])

    return (
        <>
            <CategoryFilter
                categories={categories}
                category={category}
                onCategoryChange={setCategory}
            />
            <VehicleCardList
                vehicles={vehicles}
                category={category}
                onClearCategory={() => setCategory('')}
            />
        </>
    )
}

export default Products
