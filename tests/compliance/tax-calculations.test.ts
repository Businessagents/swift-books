/**
 * Canadian Tax Calculations Test Suite
 * 
 * This test suite ensures 100% accuracy for Canadian tax calculations
 * as required by the Canada Revenue Agency (CRA) and provincial tax authorities.
 * 
 * Test Coverage:
 * - GST/HST calculations for all provinces and territories
 * - Precision and rounding according to CRA guidelines
 * - Edge cases and boundary conditions
 * - Pre-tax and post-tax calculations
 * - Quarterly GST summary calculations
 */

import { describe, it, expect } from 'vitest'
import {
  calculateGSTHST,
  calculatePreTax,
  getTaxRates,
  getAllProvinces,
  calculateQuarterlyGSTSummary,
  TAX_RATES,
  type TaxCalculation,
  type TaxRates
} from '../../src/lib/tax-calculator'

describe('Canadian Tax Calculator - Core Functions', () => {
  describe('calculateGSTHST', () => {
    it('should calculate HST correctly for Ontario (13%)', () => {
      const result = calculateGSTHST(100, 'ON')
      
      expect(result.beforeTax).toBe(100)
      expect(result.gst).toBe(0)
      expect(result.pst).toBe(0)
      expect(result.hst).toBe(13)
      expect(result.totalTax).toBe(13)
      expect(result.afterTax).toBe(113)
    })

    it('should calculate GST + PST correctly for British Columbia (5% + 7%)', () => {
      const result = calculateGSTHST(100, 'BC')
      
      expect(result.beforeTax).toBe(100)
      expect(result.gst).toBe(5)
      expect(result.pst).toBe(7)
      expect(result.hst).toBe(0)
      expect(result.totalTax).toBe(12)
      expect(result.afterTax).toBe(112)
    })

    it('should calculate GST only for Alberta (5%)', () => {
      const result = calculateGSTHST(100, 'AB')
      
      expect(result.beforeTax).toBe(100)
      expect(result.gst).toBe(5)
      expect(result.pst).toBe(0)
      expect(result.hst).toBe(0)
      expect(result.totalTax).toBe(5)
      expect(result.afterTax).toBe(105)
    })

    it('should calculate Quebec taxes correctly (GST 5% + QST 9.975%)', () => {
      const result = calculateGSTHST(100, 'QC')
      
      expect(result.beforeTax).toBe(100)
      expect(result.gst).toBe(5)
      expect(result.pst).toBe(9.98) // Rounded to 2 decimal places
      expect(result.hst).toBe(0)
      expect(result.totalTax).toBe(14.98)
      expect(result.afterTax).toBe(114.98)
    })

    it('should handle case-insensitive province codes', () => {
      const upperCase = calculateGSTHST(100, 'ON')
      const lowerCase = calculateGSTHST(100, 'on')
      const mixedCase = calculateGSTHST(100, 'On')
      
      expect(upperCase).toEqual(lowerCase)
      expect(upperCase).toEqual(mixedCase)
    })

    it('should default to Ontario rates for invalid province codes', () => {
      const invalidProvince = calculateGSTHST(100, 'XX')
      const ontario = calculateGSTHST(100, 'ON')
      
      expect(invalidProvince).toEqual(ontario)
    })

    it('should handle decimal amounts with proper rounding', () => {
      const result = calculateGSTHST(33.33, 'ON')
      
      expect(result.beforeTax).toBe(33.33)
      expect(result.hst).toBe(4.33) // 33.33 * 0.13 = 4.3329, rounded to 4.33
      expect(result.totalTax).toBe(4.33)
      expect(result.afterTax).toBe(37.66)
    })

    it('should handle zero amounts', () => {
      const result = calculateGSTHST(0, 'ON')
      
      expect(result.beforeTax).toBe(0)
      expect(result.totalTax).toBe(0)
      expect(result.afterTax).toBe(0)
    })

    it('should handle negative amounts (for refunds/credits)', () => {
      const result = calculateGSTHST(-100, 'ON')
      
      expect(result.beforeTax).toBe(-100)
      expect(result.hst).toBe(-13)
      expect(result.totalTax).toBe(-13)
      expect(result.afterTax).toBe(-113)
    })
  })

  describe('calculatePreTax', () => {
    it('should correctly reverse-calculate pre-tax amount for Ontario HST', () => {
      const result = calculatePreTax(113, 'ON')
      
      expect(result.beforeTax).toBeCloseTo(100, 2)
      expect(result.hst).toBeCloseTo(13, 2)
      expect(result.afterTax).toBeCloseTo(113, 2)
    })

    it('should correctly reverse-calculate pre-tax amount for BC GST+PST', () => {
      const result = calculatePreTax(112, 'BC')
      
      expect(result.beforeTax).toBeCloseTo(100, 2)
      expect(result.gst).toBeCloseTo(5, 2)
      expect(result.pst).toBeCloseTo(7, 2)
      expect(result.afterTax).toBeCloseTo(112, 2)
    })

    it('should handle complex decimal amounts', () => {
      const result = calculatePreTax(1234.56, 'QC')
      const expectedPreTax = 1234.56 / 1.14975
      
      expect(result.beforeTax).toBeCloseTo(expectedPreTax, 2)
      expect(result.afterTax).toBeCloseTo(1234.56, 2)
    })
  })

  describe('getTaxRates', () => {
    it('should return correct tax rates for all provinces', () => {
      const ontarioRates = getTaxRates('ON')
      expect(ontarioRates.hst).toBe(0.13)
      expect(ontarioRates.totalRate).toBe(0.13)

      const bcRates = getTaxRates('BC')
      expect(bcRates.gst).toBe(0.05)
      expect(bcRates.pst).toBe(0.07)
      expect(bcRates.totalRate).toBe(0.12)

      const albertaRates = getTaxRates('AB')
      expect(albertaRates.gst).toBe(0.05)
      expect(albertaRates.totalRate).toBe(0.05)
    })

    it('should default to Ontario rates for invalid province', () => {
      const invalidRates = getTaxRates('XX')
      const ontarioRates = getTaxRates('ON')
      
      expect(invalidRates).toEqual(ontarioRates)
    })
  })

  describe('getAllProvinces', () => {
    it('should return all 13 provinces and territories', () => {
      const provinces = getAllProvinces()
      
      expect(provinces).toHaveLength(13)
      expect(provinces.map(p => p.code)).toContain('ON')
      expect(provinces.map(p => p.code)).toContain('BC')
      expect(provinces.map(p => p.code)).toContain('QC')
      expect(provinces.map(p => p.code)).toContain('AB')
    })

    it('should include correct province names and rates', () => {
      const provinces = getAllProvinces()
      const ontario = provinces.find(p => p.code === 'ON')
      
      expect(ontario?.name).toBe('Ontario')
      expect(ontario?.rate).toBe(0.13)
    })
  })

  describe('calculateQuarterlyGSTSummary', () => {
    const mockExpenses = [
      { amount: 100, tax_amount: 13, expense_date: '2024-01-15' },
      { amount: 200, tax_amount: 26, expense_date: '2024-02-15' },
      { amount: 150, tax_amount: 19.5, expense_date: '2024-03-15' },
      { amount: 300, tax_amount: 39, expense_date: '2024-04-15' }, // Outside Q1
    ]

    it('should calculate Q1 summary correctly', () => {
      const summary = calculateQuarterlyGSTSummary(
        mockExpenses,
        '2024-01-01',
        '2024-03-31'
      )

      expect(summary.period.start).toBe('2024-01-01')
      expect(summary.period.end).toBe('2024-03-31')
      expect(summary.expenses.count).toBe(3)
      expect(summary.expenses.totalAmount).toBe(450)
      expect(summary.expenses.totalTaxPaid).toBe(58.5)
      expect(summary.inputTaxCredits).toBe(58.5)
    })

    it('should handle empty expense arrays', () => {
      const summary = calculateQuarterlyGSTSummary(
        [],
        '2024-01-01',
        '2024-03-31'
      )

      expect(summary.expenses.count).toBe(0)
      expect(summary.expenses.totalAmount).toBe(0)
      expect(summary.expenses.totalTaxPaid).toBe(0)
      expect(summary.inputTaxCredits).toBe(0)
    })

    it('should handle expenses with no tax amounts', () => {
      const expensesNoTax = [
        { amount: 100, tax_amount: 0, expense_date: '2024-01-15' },
        { amount: 200, tax_amount: 0, expense_date: '2024-02-15' },
      ]

      const summary = calculateQuarterlyGSTSummary(
        expensesNoTax,
        '2024-01-01',
        '2024-03-31'
      )

      expect(summary.expenses.totalAmount).toBe(300)
      expect(summary.expenses.totalTaxPaid).toBe(0)
      expect(summary.inputTaxCredits).toBe(0)
    })
  })
})

describe('CRA Compliance - Precision and Rounding', () => {
  it('should round tax amounts to 2 decimal places per CRA requirements', () => {
    // Test various amounts that could cause precision issues
    const testCases = [
      { amount: 33.33, province: 'ON', expectedHST: 4.33 },
      { amount: 66.67, province: 'ON', expectedHST: 8.67 },
      { amount: 999.99, province: 'QC', expectedGST: 50.00, expectedPST: 99.75 },
    ]

    testCases.forEach(({ amount, province, expectedHST, expectedGST, expectedPST }) => {
      const result = calculateGSTHST(amount, province)
      
      if (expectedHST) {
        expect(result.hst).toBe(expectedHST)
      }
      if (expectedGST) {
        expect(result.gst).toBe(expectedGST)
      }
      if (expectedPST) {
        expect(result.pst).toBe(expectedPST)
      }
    })
  })

  it('should maintain precision for large monetary amounts', () => {
    const largeAmount = 1000000.99
    const result = calculateGSTHST(largeAmount, 'ON')
    
    expect(result.beforeTax).toBe(largeAmount)
    expect(result.hst).toBe(130000.13) // Properly rounded
    expect(result.afterTax).toBe(1130001.12)
  })

  it('should handle fractional cents correctly', () => {
    // Amount that results in fractional cents for tax
    const result = calculateGSTHST(10.01, 'ON')
    
    expect(result.hst).toBe(1.30) // 10.01 * 0.13 = 1.3013, rounded to 1.30
    expect(result.afterTax).toBe(11.31)
  })
})

describe('Edge Cases and Error Handling', () => {
  it('should handle very small amounts', () => {
    const result = calculateGSTHST(0.01, 'ON')
    
    expect(result.hst).toBe(0) // 0.01 * 0.13 = 0.0013, rounded to 0.00
    expect(result.afterTax).toBe(0.01)
  })

  it('should handle very large amounts', () => {
    const maxAmount = 999999999.99
    const result = calculateGSTHST(maxAmount, 'AB')
    
    expect(result.gst).toBe(50000000)  // Rounded due to precision limits
    expect(result.afterTax).toBe(1049999999.99)
  })

  it('should handle missing province parameter', () => {
    const result = calculateGSTHST(100)
    
    // Should default to Ontario
    expect(result.hst).toBe(13)
    expect(result.totalTax).toBe(13)
  })

  it('should validate all tax rates sum correctly', () => {
    Object.entries(TAX_RATES).forEach(([province, rates]) => {
      const calculatedTotal = rates.gst + rates.pst + rates.hst
      expect(calculatedTotal).toBeCloseTo(rates.totalRate, 5)
    })
  })
})

describe('Provincial Tax Rate Validation', () => {
  it('should have correct HST rates for Atlantic provinces', () => {
    const atlanticProvinces = ['NB', 'NL', 'NS', 'PE']
    
    atlanticProvinces.forEach(province => {
      const rates = getTaxRates(province)
      expect(rates.hst).toBe(0.15)
      expect(rates.gst).toBe(0)
      expect(rates.pst).toBe(0)
      expect(rates.totalRate).toBe(0.15)
    })
  })

  it('should have correct GST-only rates for territories and Alberta', () => {
    const gstOnlyRegions = ['AB', 'NT', 'NU', 'YT']
    
    gstOnlyRegions.forEach(region => {
      const rates = getTaxRates(region)
      expect(rates.gst).toBe(0.05)
      expect(rates.pst).toBe(0)
      expect(rates.hst).toBe(0)
      expect(rates.totalRate).toBe(0.05)
    })
  })

  it('should have unique Quebec QST rate', () => {
    const qcRates = getTaxRates('QC')
    
    expect(qcRates.gst).toBe(0.05)
    expect(qcRates.pst).toBe(0.09975) // QST rate
    expect(qcRates.hst).toBe(0)
    expect(qcRates.totalRate).toBe(0.14975)
  })
})
