import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import App from '../src/App'
import { API_URL } from '../src/config'

vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const vehicles = [
  {
    _id: 'sedan-1',
    nome: 'Honda Civic',
    ano: 2021,
    descricao: 'Sedan confortável\n  Bem conservado',
    preco: 125000,
    categoria: 'Sedan',
    imagens: ['/civic.jpg', '/civic-side.jpg'],
    imagemIds: ['000000000000000000000001', '000000000000000000000002'],
    imagemNomes: ['civic.jpg', 'civic-side.jpg'],
  },
  {
    _id: 'suv-1',
    nome: 'Jeep Compass',
    ano: 2023,
    descricao: 'SUV para a família',
    preco: 145000,
    categoria: 'SUV',
    imagens: ['/compass.jpg'],
    imagemIds: ['000000000000000000000003'],
    imagemNomes: ['compass.jpg'],
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
    axios.post.mockReset()
    axios.put.mockReset()
    axios.delete.mockReset()
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

    expect(await screen.findByRole('link', { name: 'Ver detalhes de Honda Civic, 2021' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver detalhes de Jeep Compass, 2023' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Seu próximo carro está mais perto.' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'SUV' }))
    expect(await screen.findByRole('link', { name: 'Ver detalhes de Jeep Compass, 2023' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Ver detalhes de Honda Civic, 2021' })).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'SUV' }))
    expect(await screen.findByRole('link', { name: 'Ver detalhes de Honda Civic, 2021' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => {
      expect(window.localStorage.getItem('portal-veiculos-theme')).toBe('dark')
    })

    fireEvent.click(screen.getByRole('link', { name: 'Ver detalhes de Honda Civic, 2021' }))
    expect(await screen.findByRole('heading', { name: 'Honda Civic, 2021' })).toBeInTheDocument()
    const description = screen.getByText('Sedan confortável Bem conservado')
    expect(description.textContent).toBe('Sedan confortável\n  Bem conservado')
    const teamContactLink = screen.getByRole('link', { name: /Falar com a equipe/ })
    expect(teamContactLink).toHaveAttribute('href', '#questionario')
    expect(document.querySelector('#questionario')).toHaveTextContent('Responda nosso questionário')
    const stockLink = screen.getByRole('link', { name: 'Voltar ao estoque' })
    expect(stockLink).toHaveClass('detailBack')
    expect(stockLink).toHaveAttribute('href', '/')
    fireEvent.click(screen.getByRole('button', { name: 'Ver imagem 2 de Honda Civic, 2021' }))
    expect(screen.getByRole('img', { name: 'Honda Civic, 2021' })).toHaveAttribute('src', '/civic-side.jpg')
    expect(screen.getByText(content => content.includes('125.000,00'))).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('radio', { name: 'Sim' })[1])
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

  it('sends the lojista to the admin panel after successful login', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'test-token' } })

    const { container } = openAt('/')
    fireEvent.click(screen.getByRole('link', { name: /Painel lojista/ }))
    expect(await screen.findByRole('heading', { name: 'Acesse sua conta' })).toBeInTheDocument()

    const fields = container.querySelectorAll('input')
    expect(fields).toHaveLength(2)
    expect(fields[0]).toHaveAttribute('name', 'usuario')
    const password = fields[1]
    expect(password).toHaveAttribute('name', 'senha')
    expect(password).toHaveAttribute('type', 'password')

    fireEvent.change(fields[0], { target: { value: 'lojista' } })
    fireEvent.change(password, { target: { value: 'senha-segura' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL.replace(/\/vehicles\/?$/, '/login')}`,
        { username: 'lojista', password: 'senha-segura' },
      )
    })
    expect(await screen.findByRole('heading', { name: 'Painel lojista' })).toBeInTheDocument()
    expect(window.localStorage.getItem('portal-veiculos-token')).toBe('test-token')
  })

  it('requires authentication and supports removing and adding vehicle images while editing', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { token: 'test-token' } })
      .mockResolvedValueOnce({ data: { ...vehicles[0], _id: 'new-vehicle' } })
    axios.put.mockResolvedValueOnce({ data: vehicles[0] })
    axios.delete.mockResolvedValueOnce({ data: { message: 'Vehicle deleted successfully' } })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(file => `blob:${file.name}`),
    })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })

    openAt('/admin')
    expect(await screen.findByRole('heading', { name: 'Acesse sua conta' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'lojista' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-segura' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Veículos cadastrados' })).toBeInTheDocument()
    expect(await screen.findByText('Honda Civic')).toBeInTheDocument()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])

    fireEvent.click(screen.getByAltText('civic.jpg'))
    expect(screen.getByRole('button', { name: 'Remover imagem civic.jpg' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Marca'), { target: { value: 'Honda' } })
    fireEvent.change(screen.getByLabelText('Ano'), { target: { value: '2021' } })
    fireEvent.click(screen.getByRole('button', { name: 'Remover imagem civic.jpg' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(axios.put).toHaveBeenCalledOnce())
    const [updateUrl, updateData, authConfig] = axios.put.mock.calls[0]
    expect(updateUrl).toBe(`${API_URL}/sedan-1`)
    expect(updateData.get('keepImageIds')).toBe('["000000000000000000000002"]')
    expect(updateData.getAll('imagens')).toHaveLength(0)
    expect(authConfig.headers.Authorization).toBe('Bearer test-token')

    expect(await screen.findByRole('button', { name: 'Cadastrar veículo' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Nome do veículo'), { target: { value: 'Toyota Corolla' } })
    fireEvent.change(screen.getByLabelText('Marca'), { target: { value: 'Toyota' } })
    fireEvent.change(screen.getByLabelText('Ano'), { target: { value: '2024' } })
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'SeDaN' } })
    fireEvent.change(screen.getByLabelText('Preço (R$)'), { target: { value: '135000' } })
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Sedan confortável' } })

    const firstPhoto = new window.File(['photo'], 'corolla-old.jpg', { type: 'image/jpeg' })
    const imageInput = screen.getByLabelText('Adicionar imagens')
    fireEvent.change(imageInput, { target: { files: [firstPhoto] } })
    expect(await screen.findByAltText('Prévia de corolla-old.jpg')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remover nova imagem corolla-old.jpg' }))
    expect(screen.queryByAltText('Prévia de corolla-old.jpg')).not.toBeInTheDocument()

    const newPhoto = new window.File(['photo'], 'corolla.jpg', { type: 'image/jpeg' })
    fireEvent.change(imageInput, { target: { files: [newPhoto] } })
    expect(await screen.findByAltText('Prévia de corolla.jpg')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar veículo' }))

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2))
    const [createUrl, createData, createAuthConfig] = axios.post.mock.calls[1]
    expect(createUrl).toBe(API_URL)
    expect(createData.get('nome')).toBe('Toyota Corolla')
    expect(createData.get('categoria')).toBe('sedan')
    expect(createData.getAll('imagens')).toHaveLength(1)
    expect(createData.get('imagens').name).toBe('corolla.jpg')
    expect(createAuthConfig.headers.Authorization).toBe('Bearer test-token')

    fireEvent.click(screen.getAllByRole('button', { name: 'Remover' })[1])
    await waitFor(() => expect(axios.delete).toHaveBeenCalledOnce())
    expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/suv-1`, {
      headers: { Authorization: 'Bearer test-token' },
    })
    confirm.mockRestore()
    if (originalCreateObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectURL })
    } else {
      delete URL.createObjectURL
    }
    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectURL })
    } else {
      delete URL.revokeObjectURL
    }
  })
})
