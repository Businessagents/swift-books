// Canadian Tax Calculation Utilities
// Supports GST/HST calculations for all Canadian provinces and territories

export interface TaxRates {
  gst: number
  pst: number
  hst: number
  totalRate: number
}

export interface TaxCalculation {
  gst: number
  pst: number
  hst: number
  totalTax: number
  beforeTax: number
  afterTax: number
}

// Current Canadian tax rates (as of 2024)
export const TAX_RATES: Record<string, TaxRates> = {
  // HST Provinces
  ON: { gst: 0, pst: 0, hst: 0.13, totalRate: 0.13 }, // Ontario
  NB: { gst: 0, pst: 0, hst: 0.15, totalRate: 0.15 }, // New Brunswick
  NL: { gst: 0, pst: 0, hst: 0.15, totalRate: 0.15 }, // Newfoundland and Labrador
  NS: { gst: 0, pst: 0, hst: 0.15, totalRate: 0.15 }, // Nova Scotia
  PE: { gst: 0, pst: 0, hst: 0.15, totalRate: 0.15 }, // Prince Edward Island

  // GST + PST Provinces
  BC: { gst: 0.05, pst: 0.07, hst: 0, totalRate: 0.12 }, // British Columbia
  SK: { gst: 0.05, pst: 0.06, hst: 0, totalRate: 0.11 }, // Saskatchewan
  MB: { gst: 0.05, pst: 0.07, hst: 0, totalRate: 0.12 }, // Manitoba
  QC: { gst: 0.05, pst: 0.09975, hst: 0, totalRate: 0.14975 }, // Quebec (GST + QST)

  // GST Only Territories
  AB: { gst: 0.05, pst: 0, hst: 0, totalRate: 0.05 }, // Alberta
  NT: { gst: 0.05, pst: 0, hst: 0, totalRate: 0.05 }, // Northwest Territories
  NU: { gst: 0.05, pst: 0, hst: 0, totalRate: 0.05 }, // Nunavut
  YT: { gst: 0.05, pst: 0, hst: 0, totalRate: 0.05 }, // Yukon
}

/**
 * Calculate GST/HST for a given amount and province
 * @param amount - The pre-tax amount
 * @param province - Canadian province/territory code (e.g., 'ON', 'BC', 'AB')
 * @returns TaxCalculation object with breakdown of taxes
 */
export function calculateGSTHST(amount: number, province: string = 'ON'): TaxCalculation {
  const rates = TAX_RATES[province.toUpperCase()] || TAX_RATES.ON
  
  const gst = amount * rates.gst
  const pst = amount * rates.pst
  const hst = amount * rates.hst
  const totalTax = gst + pst + hst
  
  return {
    gst: Math.round(gst * 100) / 100,
    pst: Math.round(pst * 100) / 100,
    hst: Math.round(hst * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    beforeTax: amount,
    afterTax: Math.round((amount + totalTax) * 100) / 100
  }
}

/**
 * Calculate the pre-tax amount from a total that includes tax
 * @param totalAmount - The amount including tax
 * @param province - Canadian province/territory code
 * @returns TaxCalculation object with breakdown
 */
export function calculatePreTax(totalAmount: number, province: string = 'ON'): TaxCalculation {
  const rates = TAX_RATES[province.toUpperCase()] || TAX_RATES.ON
  const beforeTax = totalAmount / (1 + rates.totalRate)
  
  return calculateGSTHST(beforeTax, province)
}

/**
 * Get the tax rate for a specific province
 * @param province - Canadian province/territory code
 * @returns TaxRates object
 */
export function getTaxRates(province: string): TaxRates {
  return TAX_RATES[province.toUpperCase()] || TAX_RATES.ON
}

/**
 * Get all available provinces and their tax rates
 * @returns Array of province codes and names with tax rates
 */
export function getAllProvinces() {
  return [
    { code: 'AB', name: 'Alberta', rate: TAX_RATES.AB.totalRate },
    { code: 'BC', name: 'British Columbia', rate: TAX_RATES.BC.totalRate },
    { code: 'MB', name: 'Manitoba', rate: TAX_RATES.MB.totalRate },
    { code: 'NB', name: 'New Brunswick', rate: TAX_RATES.NB.totalRate },
    { code: 'NL', name: 'Newfoundland and Labrador', rate: TAX_RATES.NL.totalRate },
    { code: 'NS', name: 'Nova Scotia', rate: TAX_RATES.NS.totalRate },
    { code: 'NT', name: 'Northwest Territories', rate: TAX_RATES.NT.totalRate },
    { code: 'NU', name: 'Nunavut', rate: TAX_RATES.NU.totalRate },
    { code: 'ON', name: 'Ontario', rate: TAX_RATES.ON.totalRate },
    { code: 'PE', name: 'Prince Edward Island', rate: TAX_RATES.PE.totalRate },
    { code: 'QC', name: 'Quebec', rate: TAX_RATES.QC.totalRate },
    { code: 'SK', name: 'Saskatchewan', rate: TAX_RATES.SK.totalRate },
    { code: 'YT', name: 'Yukon', rate: TAX_RATES.YT.totalRate },
  ]
}

/**
 * Calculate quarterly GST/HST summary for filing
 * @param expenses - Array of expense objects with amount, tax_amount, and expense_date
 * @param startDate - Quarter start date
 * @param endDate - Quarter end date
 * @returns Summary object for GST/HST filing
 */
export function calculateQuarterlyGSTSummary(
  expenses: Array<{ amount: number; tax_amount: number; expense_date: string }>,
  startDate: string,
  endDate: string
) {
  const quarterExpenses = expenses.filter(
    expense => expense.expense_date >= startDate && expense.expense_date <= endDate
  )

  const totalExpenses = quarterExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalTaxPaid = quarterExpenses.reduce((sum, expense) => sum + (expense.tax_amount || 0), 0)

  return {
    period: {
      start: startDate,
      end: endDate
    },
    expenses: {
      count: quarterExpenses.length,
      totalAmount: Math.round(totalExpenses * 100) / 100,
      totalTaxPaid: Math.round(totalTaxPaid * 100) / 100
    },
    // Note: For a complete GST return, you'd also need sales/revenue data
    // This is just the expense/ITC (Input Tax Credit) portion
    inputTaxCredits: Math.round(totalTaxPaid * 100) / 100
  }
}