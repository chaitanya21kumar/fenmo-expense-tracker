import { describe, it, expect } from 'vitest'
import { amountToPaise, paiseToAmount } from '@/lib/validation'

describe('money utilities', () => {
  it('converts INR string to paise correctly', () => {
    expect(amountToPaise('1')).toBe(100)
    expect(amountToPaise('1.5')).toBe(150)
    expect(amountToPaise('1.50')).toBe(150)
    expect(amountToPaise('100.99')).toBe(10099)
    expect(amountToPaise('0.01')).toBe(1)
  })

  it('converts paise back to INR string', () => {
    expect(paiseToAmount(100)).toBe('1.00')
    expect(paiseToAmount(150)).toBe('1.50')
    expect(paiseToAmount(10099)).toBe('100.99')
    expect(paiseToAmount(1)).toBe('0.01')
  })

  it('round-trips correctly', () => {
    const amounts = ['1.00', '150.75', '9999.99']
    for (const a of amounts) {
      expect(paiseToAmount(amountToPaise(a))).toBe(a)
    }
  })
})