import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import VehicleCardList from '../src/components/VehicleCardList'

describe('VehicleCardList', () => {
  it('explains an empty category result and lets users clear the filter', () => {
    const onClearCategory = vi.fn()
    render(
      <VehicleCardList
        vehicles={[]}
        category="SUV"
        onClearCategory={onClearCategory}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhum veículo encontrado na categoria SUV.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }))
    expect(onClearCategory).toHaveBeenCalledOnce()
  })

  it('shows the general empty inventory message when no category is selected', () => {
    render(<VehicleCardList vehicles={[]} category="" onClearCategory={() => {}} />)

    expect(screen.getByRole('status')).toHaveTextContent('Nenhum veículo cadastrado.')
    expect(screen.queryByRole('button', { name: 'Ver todos' })).not.toBeInTheDocument()
  })
})
