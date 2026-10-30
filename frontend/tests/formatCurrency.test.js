import { describe, expect, it } from 'vitest'
import formatCurrency from '../src/utils/formatCurrency'

describe('formatCurrency', () => {
  it('formats vehicle prices as Brazilian reais', () => {
    expect(formatCurrency(123456.78)).toBe('R$\u00a0123.456,78')
  })

  it('formats zero without dropping the cents', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00')
  })
})
