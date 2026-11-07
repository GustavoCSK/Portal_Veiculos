import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import VehicleSocial from '../src/components/VehicleSocial'

const vehicle = { nome: 'Honda Civic', ano: 2021 }

describe('VehicleSocial', () => {
  it('renders no contact section until a vehicle is selected', () => {
    const { container } = render(<VehicleSocial vehicle={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('adds only affirmative trade and financing answers to the WhatsApp message', () => {
    render(<VehicleSocial vehicle={vehicle} />)
    const contactLink = screen.getByRole('link', { name: 'Iniciar conversa pelo WhatsApp' })
    const getMessage = () => new URL(contactLink.href).searchParams.get('text')

    expect(contactLink.closest('.msgInfo')).not.toBeNull()
    expect(screen.getByText('Tem veículo para oferecer na troca?')).toBeInTheDocument()
    expect(screen.getByText('Tem interesse em financiar?')).toBeInTheDocument()
    expect(getMessage()).toBe('Olá, estou interessado no veículo Honda Civic 2021')

    const yesAnswers = screen.getAllByRole('radio', { name: 'Sim' })
    const noAnswers = screen.getAllByRole('radio', { name: 'Não' })
    expect(yesAnswers).toHaveLength(2)
    expect(noAnswers).toHaveLength(2)
    expect(noAnswers[0]).toBeChecked()
    expect(noAnswers[1]).toBeChecked()

    fireEvent.click(yesAnswers[0])
    fireEvent.click(yesAnswers[1])
    expect(getMessage()).toBe(
      'Olá, estou interessado no veículo Honda Civic 2021. Tenho um veículo para oferecer na troca. Gostaria de financiar',
    )

    fireEvent.click(noAnswers[0])
    expect(getMessage()).toBe(
      'Olá, estou interessado no veículo Honda Civic 2021. Gostaria de financiar',
    )

    fireEvent.click(noAnswers[1])
    expect(getMessage()).toBe('Olá, estou interessado no veículo Honda Civic 2021')
  })
})
