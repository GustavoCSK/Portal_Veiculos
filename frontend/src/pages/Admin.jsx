import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { AUTH_TOKEN_KEY, API_URL } from '../config'
import formatCurrency from '../utils/formatCurrency'

const emptyVehicle = {
    nome: '',
    marca: '',
    ano: '',
    descricao: '',
    preco: '',
    categoria: '',
}

function Admin() {
    const navigate = useNavigate()
    const [vehicles, setVehicles] = useState([])
    const [vehicle, setVehicle] = useState(emptyVehicle)
    const [editingId, setEditingId] = useState(null)
    const [editingImages, setEditingImages] = useState([])
    const [newImages, setNewImages] = useState([])
    const previewUrls = useRef(new Set())
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [notice, setNotice] = useState('')
    const [formKey, setFormKey] = useState(0)

    const getAuthConfig = useCallback(() => ({
        headers: {
            Authorization: `Bearer ${window.localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
    }), [])

    const handleUnauthorized = useCallback((error) => {
        if (error.response?.status !== 401) return false
        window.localStorage.removeItem(AUTH_TOKEN_KEY)
        navigate('/login', { replace: true })
        return true
    }, [navigate])

    const loadVehicles = useCallback(async () => {
        setLoading(true)
        setErrorMessage('')
        try {
            const response = await axios.get(API_URL)
            setVehicles(response.data)
        } catch (error) {
            console.error('Erro ao carregar veículos no painel:', error)
            if (!handleUnauthorized(error)) {
                setErrorMessage('Não foi possível carregar os veículos. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }, [handleUnauthorized])

    useEffect(() => {
        let cancelled = false

        axios.get(API_URL)
            .then(response => {
                if (!cancelled) setVehicles(response.data)
            })
            .catch(error => {
                console.error('Erro ao carregar veículos no painel:', error)
                if (!cancelled && !handleUnauthorized(error)) {
                    setErrorMessage('Não foi possível carregar os veículos. Tente novamente.')
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [handleUnauthorized])

    useEffect(() => () => {
        previewUrls.current.forEach(url => URL.revokeObjectURL(url))
        previewUrls.current.clear()
    }, [])

    function removeNewImage(index) {
        const removedImage = newImages[index]
        if (removedImage) {
            URL.revokeObjectURL(removedImage.url)
            previewUrls.current.delete(removedImage.url)
        }
        setNewImages(current => current.filter((_, currentIndex) => currentIndex !== index))
    }

    function resetForm() {
        setVehicle(emptyVehicle)
        setEditingId(null)
        setEditingImages([])
        newImages.forEach(image => URL.revokeObjectURL(image.url))
        previewUrls.current.clear()
        setNewImages([])
        setFormKey(current => current + 1)
        setErrorMessage('')
        setNotice('')
    }

    function startEditing(item) {
        setVehicle({
            nome: item.nome || '',
            marca: item.marca || '',
            ano: item.ano ?? '',
            descricao: item.descricao || '',
            preco: item.preco ?? '',
            categoria: item.categoria || '',
        })
        setEditingId(item._id)
        newImages.forEach(image => URL.revokeObjectURL(image.url))
        previewUrls.current.clear()
        setNewImages([])
        setEditingImages((item.imagemIds || []).map((id, index) => ({
            id: String(id),
            url: item.imagens?.[index],
            name: item.imagemNomes?.[index] || `Imagem ${index + 1}`,
        })))
        setFormKey(current => current + 1)
        setErrorMessage('')
        setNotice('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleFieldChange(event) {
        const { name, value } = event.target
        setVehicle(current => ({ ...current, [name]: value }))
    }

    function handleImageSelection(event) {
        const files = Array.from(event.target.files)
        setNewImages(current => [
            ...current,
            ...files.map(file => {
                const url = URL.createObjectURL(file)
                previewUrls.current.add(url)
                return { file, url }
            }),
        ])
        event.target.value = ''
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setIsSaving(true)
        setErrorMessage('')
        setNotice('')

        const formData = new window.FormData()
        Object.entries(vehicle).forEach(([name, value]) => formData.append(name, value))
        newImages.forEach(({ file }) => formData.append('imagens', file))
        if (editingId) {
            formData.append('keepImageIds', JSON.stringify(editingImages.map(image => image.id)))
        }

        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData, getAuthConfig())
                setNotice('Veículo atualizado com sucesso.')
            } else {
                await axios.post(API_URL, formData, getAuthConfig())
                setNotice('Veículo cadastrado com sucesso.')
            }
            resetForm()
            await loadVehicles()
        } catch (error) {
            console.error('Erro ao salvar veículo:', error)
            if (!handleUnauthorized(error)) {
                setErrorMessage('Não foi possível salvar o veículo. Confira os dados e tente novamente.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete(item) {
        if (!window.confirm(`Remover ${item.nome} do estoque?`)) return

        setErrorMessage('')
        setNotice('')
        try {
            await axios.delete(`${API_URL}/${item._id}`, getAuthConfig())
            setVehicles(current => current.filter(currentVehicle => currentVehicle._id !== item._id))
            if (editingId === item._id) resetForm()
            setNotice('Veículo removido com sucesso.')
        } catch (error) {
            console.error('Erro ao remover veículo:', error)
            if (!handleUnauthorized(error)) {
                setErrorMessage('Não foi possível remover o veículo. Tente novamente.')
            }
        }
    }

    function handleLogout() {
        window.localStorage.removeItem(AUTH_TOKEN_KEY)
        navigate('/login', { replace: true })
    }

    return (
        <main className="adminPage">
            <header className="adminHeader">
                <Link className="adminBrand" to="/" aria-label="Portal Veículos, início">
                    <span className="loginBrandMark" aria-hidden="true">PV</span>
                    <span><strong>Portal Veículos</strong><small>Área do lojista</small></span>
                </Link>
                <div className="adminHeaderActions">
                    <Link to="/">Ver loja</Link>
                    <button type="button" onClick={handleLogout}>Sair</button>
                </div>
            </header>

            <div className="adminContent">
                <section className="adminIntro">
                    <div>
                        <p className="loginEyebrow">Gestão do estoque</p>
                        <h1>Painel lojista</h1>
                        <p>Cadastre e atualize os veículos anunciados na loja.</p>
                    </div>
                    <span className="adminInventoryCount">{vehicles.length} {vehicles.length === 1 ? 'veículo' : 'veículos'}</span>
                </section>

                <section className="adminFormCard" aria-labelledby="admin-form-title">
                    <div className="adminSectionHeading">
                        <div>
                            <h2 id="admin-form-title">{editingId ? 'Editar veículo' : 'Adicionar veículo'}</h2>
                            <p>Preencha as informações do anúncio.</p>
                        </div>
                        {editingId && <button className="adminCancelButton" type="button" onClick={resetForm}>Cancelar edição</button>}
                    </div>
                    <form className="adminForm" key={formKey} onSubmit={handleSubmit}>
                        <label className="adminField">
                            <span>Nome do veículo</span>
                            <input name="nome" value={vehicle.nome} onChange={handleFieldChange} required />
                        </label>
                        <label className="adminField">
                            <span>Marca</span>
                            <input name="marca" value={vehicle.marca} onChange={handleFieldChange} required />
                        </label>
                        <label className="adminField">
                            <span>Ano</span>
                            <input name="ano" type="number" min="1900" max="2100" value={vehicle.ano} onChange={handleFieldChange} required />
                        </label>
                        <label className="adminField">
                            <span>Categoria</span>
                            <input name="categoria" value={vehicle.categoria} onChange={handleFieldChange} required />
                        </label>
                        <label className="adminField">
                            <span>Preço (R$)</span>
                            <input name="preco" type="number" min="0" step="0.01" value={vehicle.preco} onChange={handleFieldChange} required />
                        </label>
                        <label className="adminField adminFieldWide">
                            <span>Descrição</span>
                            <textarea name="descricao" rows="4" value={vehicle.descricao} onChange={handleFieldChange} required />
                        </label>
                        <div className="adminField adminFieldWide">
                            <span>Fotos do veículo</span>
                            {editingId && editingImages.length > 0 && (
                                <div className="adminImageList">
                                    {editingImages.map((image, index) => (
                                        <div className="adminImageItem" key={image.id}>
                                            <img src={image.url} alt={image.name} />
                                            <button
                                                type="button"
                                                aria-label={`Remover imagem ${image.name}`}
                                                onClick={() => setEditingImages(current => current.filter((_, currentIndex) => currentIndex !== index))}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {newImages.length > 0 && (
                                <div className="adminImageList" aria-label="Novas imagens selecionadas">
                                    {newImages.map((image, index) => (
                                        <div className="adminImageItem" key={image.url}>
                                            <img src={image.url} alt={`Prévia de ${image.file.name}`} />
                                            <button
                                                type="button"
                                                aria-label={`Remover nova imagem ${image.file.name}`}
                                                onClick={() => removeNewImage(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <label className="adminFilePicker" htmlFor="admin-vehicle-images">
                                Adicionar imagens
                            </label>
                            <input
                                id="admin-vehicle-images"
                                className="adminFileInput"
                                name="imagens"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelection}
                            />
                            <small>{editingId ? 'Remova as fotos que não deseja manter e adicione novas imagens.' : 'Selecione até 10 imagens. Você poderá conferir e remover cada foto antes de salvar.'}</small>
                        </div>
                        {errorMessage && <p className="adminFeedback adminError" role="alert">{errorMessage}</p>}
                        {notice && <p className="adminFeedback adminSuccess" role="status">{notice}</p>}
                        <button className="adminSaveButton" type="submit" disabled={isSaving}>
                            {isSaving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar veículo'}
                        </button>
                    </form>
                </section>

                <section className="adminInventory" aria-labelledby="inventory-title">
                    <div className="adminSectionHeading">
                        <div>
                            <h2 id="inventory-title">Veículos cadastrados</h2>
                            <p>Edite as informações ou remova um anúncio do estoque.</p>
                        </div>
                        <button className="adminRefreshButton" type="button" onClick={loadVehicles} disabled={loading}>
                            Atualizar lista
                        </button>
                    </div>
                    {loading && <p className="adminLoading" role="status">Carregando veículos...</p>}
                    {!loading && !vehicles.length && <p className="adminEmpty">Ainda não há veículos cadastrados.</p>}
                    <div className="adminVehicleList">
                        {vehicles.map(item => (
                            <article className="adminVehicle" key={item._id}>
                                {item.imagens?.[0]
                                    ? <img src={item.imagens[0]} alt="" />
                                    : <div className="adminVehiclePlaceholder" aria-hidden="true">PV</div>}
                                <div className="adminVehicleInfo">
                                    <h3>{item.nome}</h3>
                                    <p>{[item.marca, item.ano, item.categoria].filter(Boolean).join(' · ')}</p>
                                    <strong>{formatCurrency(item.preco)}</strong>
                                </div>
                                <div className="adminVehicleActions">
                                    <button type="button" onClick={() => startEditing(item)}>Editar</button>
                                    <button type="button" className="adminDeleteButton" onClick={() => handleDelete(item)}>Remover</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Admin
