const brlFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

function formatCurrency(value) {
    return brlFormatter.format(value)
}

export default formatCurrency
