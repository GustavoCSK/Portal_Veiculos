import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import App from '../src/App'
import { API_URL } from '../src/config'

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}))

const vehicles = [
  {
    _id: 'sedan-1',
    nome: 'Honda Civic',
    descricao: 'Sedan confortável',
    preco: 125000,
    categoria: 'Sedan',
    imagens: ['/civic.jpg', '/civic-side.jpg'],
  },
  {
    _id: 'suv-1',
    nome: 'Jeep Compass',
    descricao: 'SUV para a família',
    preco: 145000,
    categoria: 'SUV',
    imagens: ['/compass.jpg'],
  },
]

function openAt(path = '/') {
  window.history.pushState({}, '', path)
  return render(<App />)
}

describe('vehicle portal user flows', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.pushState({}, '', '/')
    axios.get.mockImplementation(async (url) => {
      if (url === API_URL) {
        return { data: vehicles }
      }
      if (url === `${API_URL}/categoria/SUV`) {
        return { data: [vehicles[1]] }
      }
      if (url === `${API_URL}/sedan-1`) {
        return { data: vehicles[0] }
      }
      throw new Error(`Unexpected API request: ${url}`)
    })
  })

  it('loads inventory, filters and clears categories, navigates to details, and persists the theme', async () => {
    openAt()

    expect(await screen.findByRole('link', { name: 'Ver detalhes de Honda Civic' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver detalhes de Jeep Compass' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Seu próximo carro está mais perto.' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'SUV' }))
    expect(await screen.findByRole('link', { name: 'Ver detalhes de Jeep Compass' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Ver detalhes de Honda Civic' })).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'SUV' }))
    expect(await screen.findByRole('link', { name: 'Ver detalhes de Honda Civic' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => {
      expect(window.localStorage.getItem('portal-veiculos-theme')).toBe('dark')
    })

    fireEvent.click(screen.getByRole('link', { name: 'Ver detalhes de Honda Civic' }))
    expect(await screen.findByRole('heading', { name: 'Honda Civic' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver imagem 2 de Honda Civic' }))
    expect(screen.getByRole('img', { name: 'Honda Civic' })).toHaveAttribute('src', '/civic-side.jpg')
    expect(screen.getByText(content => content.includes('125.000,00'))).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Tenho interesse em financiar' }))
    const contactLink = screen.getByRole('link', { name: 'Iniciar conversa pelo WhatsApp' })
    expect(new URL(contactLink.href).searchParams.get('text')).toContain('Gostaria de financiar')

    fireEvent.click(screen.getByRole('link', { name: /Voltar ao estoque/ }))
    expect(await screen.findByRole('heading', { name: 'Veículos em destaque' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows a loading state then a useful error when a detail request fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    axios.get.mockRejectedValueOnce(new Error('not found'))

    openAt('/detalhes/missing')

    expect(screen.getByRole('status')).toHaveTextContent('Carregando veículo...')
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível encontrar este veículo.')
    expect(consoleError).toHaveBeenCalled()
  })
})
