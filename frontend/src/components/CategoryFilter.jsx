function CategoryFilter({ categories, category, onCategoryChange }) {
    return (
        <div className="categoryFilter" role="group" aria-label="Filtrar veículos por categoria">
            <button
                type="button"
                aria-pressed={category === ''}
                onClick={() => onCategoryChange('')}
            >
                Todos
            </button>
            {categories.map(cat => (
                <button
                    key={cat}
                    type="button"
                    aria-pressed={category === cat}
                    onClick={() => onCategoryChange(category === cat ? '' : cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    )
}

export default CategoryFilter
