import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CategoryFilter from '../src/components/CategoryFilter'

describe('CategoryFilter', () => {
  it('marks the active category and lets the user toggle or clear the filter', () => {
    const onCategoryChange = vi.fn()
    render(
      <CategoryFilter
        categories={['SUV', 'Sedan']}
        category="SUV"
        onCategoryChange={onCategoryChange}
      />,
    )

    expect(screen.getByRole('button', { name: 'SUV' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'SUV' }))
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))

    expect(onCategoryChange).toHaveBeenNthCalledWith(1, '')
    expect(onCategoryChange).toHaveBeenNthCalledWith(2, '')
  })
})
