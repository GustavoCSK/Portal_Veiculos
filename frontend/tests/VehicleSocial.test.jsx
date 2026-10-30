import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import VehicleSocial from '../src/components/VehicleSocial'

const vehicle = { nome: 'Honda Civic' }

describe('VehicleSocial', () => {
  it('renders no contact section until a vehicle is selected', () => {
    const { container } = render(<VehicleSocial vehicle={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('adds and removes trade and financing preferences from the WhatsApp message', () => {
    render(<VehicleSocial vehicle={vehicle} />)
    const contactLink = screen.getByRole('link', { name: 'Iniciar conversa pelo WhatsApp' })
    const getMessage = () => new URL(contactLink.href).searchParams.get('text')

    expect(getMessage()).toBe('Olá, estou interessado no veículo Honda Civic')

    fireEvent.click(screen.getByRole('checkbox', { name: 'Tenho veículo para troca' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Tenho interesse em financiar' }))
    expect(getMessage()).toBe(
      'Olá, estou interessado no veículo Honda Civic. Tenho um veículo para oferecer na troca. Gostaria de financiar',
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Tenho veículo para troca' }))
    expect(getMessage()).toBe(
      'Olá, estou interessado no veículo Honda Civic. Gostaria de financiar',
    )
  })
})
