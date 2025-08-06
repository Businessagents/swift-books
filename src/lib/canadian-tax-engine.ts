// Comprehensive Canadian Tax Engine
// Handles provincial tax calculations, ITCs, remittances, and compliance deadlines

import { TaxRates, TAX_RATES, TaxCalculation } from './tax-calculator'

export interface Province {
  code: string
  name: string
  gst: number
  pst: number
  hst: number
  qst?: number // Quebec Sales Tax
  pstName?: string // Name of provincial tax (PST, QST, etc.)
}

export interface Transaction {
  id: string
  amount: number
  taxAmount: number
  date: string
  province: string // Province where transaction occurred
  type: 'income' | 'expense'
  taxable: boolean
  description?: string
}

export interface ITCCalculation {
  eligibleAmount: number
  gstITC: number
  pstITC: number
  hstITC: number
  totalITC: number
  ineligibleAmount: number
}

export interface RemittanceCalculation {
  period: {
    start: string
    end: string
    type: 'monthly' | 'quarterly' | 'annual'
  }
  gstHstCollected: number
  gstHstPaid: number
  netGstHst: number
  pstCollected: number
  pstPaid: number
  netPst: number
  totalRemittance: number
  dueDate: string
  isOverdue: boolean
}

export interface TaxEngineConfig {
  homeProvince: string
  gstNumber?: string
  pstNumber?: string
  filingFrequency: 'monthly' | 'quarterly' | 'annual'
}

// Enhanced province data with complete tax information
export const PROVINCES: Record<string, Province> = {
  BC: {
    code: 'BC',
    name: 'British Columbia',
    gst: 0.05,
    pst: 0.07,
    hst: 0,
    pstName: 'PST'
  },
  AB: {
    code: 'AB',
    name: 'Alberta',
    gst: 0.05,
    pst: 0,
    hst: 0
  },
  ON: {
    code: 'ON',
    name: 'Ontario',
    gst: 0,
    pst: 0,
    hst: 0.13
  },
  QC: {
    code: 'QC',
    name: 'Quebec',
    gst: 0.05,
    pst: 0,
    hst: 0,
    qst: 0.09975,
    pstName: 'QST'
  },
  NS: {
    code: 'NS',
    name: 'Nova Scotia',
    gst: 0,
    pst: 0,
    hst: 0.15
  },
  NB: {
    code: 'NB',
    name: 'New Brunswick',
    gst: 0,
    pst: 0,
    hst: 0.15
  },
  NL: {
    code: 'NL',
    name: 'Newfoundland and Labrador',
    gst: 0,
    pst: 0,
    hst: 0.15
  },
  PE: {
    code: 'PE',
    name: 'Prince Edward Island',
    gst: 0,
    pst: 0,
    hst: 0.15
  },
  MB: {
    code: 'MB',
    name: 'Manitoba',
    gst: 0.05,
    pst: 0.07,
    hst: 0,
    pstName: 'PST'
  },
  SK: {
    code: 'SK',
    name: 'Saskatchewan',
    gst: 0.05,
    pst: 0.06,
    hst: 0,
    pstName: 'PST'
  },
  YT: {
    code: 'YT',
    name: 'Yukon',
    gst: 0.05,
    pst: 0,
    hst: 0
  },
  NT: {
    code: 'NT',
    name: 'Northwest Territories',
    gst: 0.05,
    pst: 0,
    hst: 0
  },
  NU: {
    code: 'NU',
    name: 'Nunavut',
    gst: 0.05,
    pst: 0,
    hst: 0
  }
}

export class CanadianTaxEngine {
  private config: TaxEngineConfig

  constructor(config: TaxEngineConfig) {
    this.config = config
  }

  /**
   * Calculate tax for a transaction based on transaction province
   */
  calculateTransactionTax(
    amount: number,
    transactionProvince: string,
    taxable: boolean = true
  ): TaxCalculation {
    if (!taxable) {
      return {
        gst: 0,
        pst: 0,
        hst: 0,
        totalTax: 0,
        beforeTax: amount,
        afterTax: amount
      }
    }

    const province = PROVINCES[transactionProvince.toUpperCase()]
    if (!province) {
      throw new Error(`Invalid province code: ${transactionProvince}`)
    }

    const gst = amount * province.gst
    const pst = amount * (province.pst + (province.qst || 0))
    const hst = amount * province.hst
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
   * Determine which province's tax rules apply
   * For income: Use transaction province
   * For expenses: Use home province for ITCs
   */
  determineApplicableProvince(transaction: Transaction): string {
    if (transaction.type === 'income') {
      return transaction.province
    } else {
      // For expenses, use home province for ITC calculations
      return this.config.homeProvince
    }
  }

  /**
   * Calculate Input Tax Credits (ITCs) for business expenses
   */
  calculateITC(expenses: Transaction[]): ITCCalculation {
    let eligibleAmount = 0
    let ineligibleAmount = 0
    let gstITC = 0
    let pstITC = 0
    let hstITC = 0

    for (const expense of expenses) {
      if (!expense.taxable) {
        ineligibleAmount += expense.amount
        continue
      }

      // Only business expenses are eligible for ITCs
      if (this.isEligibleForITC(expense)) {
        eligibleAmount += expense.amount
        
        const province = PROVINCES[expense.province.toUpperCase()]
        if (province) {
          const taxCalc = this.calculateTransactionTax(expense.amount, expense.province)
          
          // ITCs are based on tax actually paid
          if (province.hst > 0) {
            hstITC += taxCalc.hst
          } else {
            gstITC += taxCalc.gst
            // PST is generally not recoverable except in specific circumstances
            if (this.isPSTRecoverable(expense, province)) {
              pstITC += taxCalc.pst
            }
          }
        }
      } else {
        ineligibleAmount += expense.amount
      }
    }

    const totalITC = gstITC + pstITC + hstITC

    return {
      eligibleAmount: Math.round(eligibleAmount * 100) / 100,
      gstITC: Math.round(gstITC * 100) / 100,
      pstITC: Math.round(pstITC * 100) / 100,
      hstITC: Math.round(hstITC * 100) / 100,
      totalITC: Math.round(totalITC * 100) / 100,
      ineligibleAmount: Math.round(ineligibleAmount * 100) / 100
    }
  }

  /**
   * Calculate tax remittance for a period
   */
  calculateRemittance(
    incomeTransactions: Transaction[],
    expenseTransactions: Transaction[],
    periodStart: string,
    periodEnd: string
  ): RemittanceCalculation {
    // Filter transactions for the period
    const periodIncome = incomeTransactions.filter(
      t => t.date >= periodStart && t.date <= periodEnd
    )
    const periodExpenses = expenseTransactions.filter(
      t => t.date >= periodStart && t.date <= periodEnd
    )

    // Calculate taxes collected on income
    let gstHstCollected = 0
    let pstCollected = 0

    for (const income of periodIncome) {
      if (income.taxable) {
        const taxCalc = this.calculateTransactionTax(income.amount, income.province)
        if (PROVINCES[income.province.toUpperCase()]?.hst > 0) {
          gstHstCollected += taxCalc.hst
        } else {
          gstHstCollected += taxCalc.gst
          pstCollected += taxCalc.pst
        }
      }
    }

    // Calculate ITCs from expenses
    const itcCalc = this.calculateITC(periodExpenses)
    const gstHstPaid = itcCalc.gstITC + itcCalc.hstITC
    const pstPaid = itcCalc.pstITC

    // Net amounts
    const netGstHst = gstHstCollected - gstHstPaid
    const netPst = pstCollected - pstPaid
    const totalRemittance = netGstHst + netPst

    // Calculate due date
    const dueDate = this.calculateDueDate(periodEnd)
    const isOverdue = new Date() > new Date(dueDate)

    return {
      period: {
        start: periodStart,
        end: periodEnd,
        type: this.config.filingFrequency
      },
      gstHstCollected: Math.round(gstHstCollected * 100) / 100,
      gstHstPaid: Math.round(gstHstPaid * 100) / 100,
      netGstHst: Math.round(netGstHst * 100) / 100,
      pstCollected: Math.round(pstCollected * 100) / 100,
      pstPaid: Math.round(pstPaid * 100) / 100,
      netPst: Math.round(netPst * 100) / 100,
      totalRemittance: Math.round(totalRemittance * 100) / 100,
      dueDate,
      isOverdue
    }
  }

  /**
   * Get upcoming remittance deadlines
   */
  getUpcomingDeadlines(months: number = 12): Array<{
    period: string
    dueDate: string
    type: string
    daysUntilDue: number
  }> {
    const deadlines: Array<{
      period: string
      dueDate: string
      type: string
      daysUntilDue: number
    }> = []

    const today = new Date()
    const endDate = new Date()
    endDate.setMonth(today.getMonth() + months)

    // Generate deadlines based on filing frequency
    if (this.config.filingFrequency === 'monthly') {
      for (let i = 0; i < months; i++) {
        const date = new Date()
        date.setMonth(today.getMonth() + i + 1)
        date.setDate(this.getMonthlyDeadlineDay())
        
        if (date <= endDate) {
          const period = this.formatPeriod(date, 'monthly')
          const daysUntilDue = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          deadlines.push({
            period,
            dueDate: date.toISOString().split('T')[0],
            type: 'GST/HST Monthly',
            daysUntilDue
          })
        }
      }
    } else if (this.config.filingFrequency === 'quarterly') {
      const quarters = Math.ceil(months / 3)
      for (let i = 0; i < quarters; i++) {
        const date = new Date()
        date.setMonth(today.getMonth() + (i + 1) * 3)
        date.setDate(this.getQuarterlyDeadlineDay())
        
        if (date <= endDate) {
          const period = this.formatPeriod(date, 'quarterly')
          const daysUntilDue = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          deadlines.push({
            period,
            dueDate: date.toISOString().split('T')[0],
            type: 'GST/HST Quarterly',
            daysUntilDue
          })
        }
      }
    }

    return deadlines.sort((a, b) => a.daysUntilDue - b.daysUntilDue)
  }

  /**
   * Validate tax calculation accuracy
   */
  validateTaxCalculation(
    amount: number,
    calculatedTax: TaxCalculation,
    province: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const expectedTax = this.calculateTransactionTax(amount, province)

    const tolerance = 0.01 // 1 cent tolerance for rounding

    if (Math.abs(calculatedTax.gst - expectedTax.gst) > tolerance) {
      errors.push(`GST mismatch: expected ${expectedTax.gst}, got ${calculatedTax.gst}`)
    }

    if (Math.abs(calculatedTax.pst - expectedTax.pst) > tolerance) {
      errors.push(`PST mismatch: expected ${expectedTax.pst}, got ${calculatedTax.pst}`)
    }

    if (Math.abs(calculatedTax.hst - expectedTax.hst) > tolerance) {
      errors.push(`HST mismatch: expected ${expectedTax.hst}, got ${calculatedTax.hst}`)
    }

    if (Math.abs(calculatedTax.totalTax - expectedTax.totalTax) > tolerance) {
      errors.push(`Total tax mismatch: expected ${expectedTax.totalTax}, got ${calculatedTax.totalTax}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Private helper methods

  private isEligibleForITC(expense: Transaction): boolean {
    // Basic ITC eligibility - in practice, this would be more complex
    // and would consider the nature of the expense
    if (!expense.description) return true
    
    const ineligiblePatterns = [
      'meals', 'entertainment', 'personal', 'gift', 'club membership'
    ]
    
    const description = expense.description.toLowerCase()
    return !ineligiblePatterns.some(pattern => description.includes(pattern))
  }

  private isPSTRecoverable(expense: Transaction, province: Province): boolean {
    // PST is generally not recoverable except for specific industries
    // This is a simplified implementation
    if (province.code === 'QC' && province.qst) {
      // QST in Quebec is recoverable similar to GST
      return true
    }
    
    // For other provinces, PST is generally not recoverable for most businesses
    return false
  }

  private calculateDueDate(periodEnd: string): string {
    const endDate = new Date(periodEnd)
    
    if (this.config.filingFrequency === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(this.getMonthlyDeadlineDay())
    } else if (this.config.filingFrequency === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(this.getQuarterlyDeadlineDay())
    } else if (this.config.filingFrequency === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1)
      endDate.setMonth(2) // March
      endDate.setDate(31)
    }

    return endDate.toISOString().split('T')[0]
  }

  private getMonthlyDeadlineDay(): number {
    return 15 // 15th of following month
  }

  private getQuarterlyDeadlineDay(): number {
    return 31 // Last day of following month
  }

  private formatPeriod(date: Date, frequency: string): string {
    if (frequency === 'monthly') {
      return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
    } else if (frequency === 'quarterly') {
      const quarter = Math.ceil(date.getMonth() / 3)
      return `${date.getFullYear()}-Q${quarter}`
    }
    return date.getFullYear().toString()
  }
}

// Utility functions for common tax operations

/**
 * Create a new tax engine instance
 */
export function createTaxEngine(config: TaxEngineConfig): CanadianTaxEngine {
  return new CanadianTaxEngine(config)
}

/**
 * Get all provinces with their tax information
 */
export function getAllProvinceTaxInfo(): Province[] {
  return Object.values(PROVINCES)
}

/**
 * Quick tax calculation for a single transaction
 */
export function quickTaxCalc(amount: number, province: string): TaxCalculation {
  const engine = new CanadianTaxEngine({ homeProvince: province, filingFrequency: 'quarterly' })
  return engine.calculateTransactionTax(amount, province)
}

/**
 * Validate province code
 */
export function isValidProvince(provinceCode: string): boolean {
  return provinceCode.toUpperCase() in PROVINCES
}

/**
 * Get province tax summary for display
 */
export function getProvinceTaxSummary(provinceCode: string): {
  province: Province
  description: string
  effectiveRate: number
} | null {
  const province = PROVINCES[provinceCode.toUpperCase()]
  if (!province) return null

  let description = ''
  let effectiveRate = 0

  if (province.hst > 0) {
    description = `HST ${(province.hst * 100).toFixed(2)}%`
    effectiveRate = province.hst
  } else {
    const components: string[] = []
    
    if (province.gst > 0) {
      components.push(`GST ${(province.gst * 100).toFixed(2)}%`)
      effectiveRate += province.gst
    }
    
    if (province.pst > 0) {
      components.push(`PST ${(province.pst * 100).toFixed(2)}%`)
      effectiveRate += province.pst
    }
    
    if (province.qst) {
      components.push(`QST ${(province.qst * 100).toFixed(2)}%`)
      effectiveRate += province.qst
    }
    
    description = components.join(' + ')
  }

  return {
    province,
    description,
    effectiveRate: Math.round(effectiveRate * 10000) / 100 // Round to 2 decimal places as percentage
  }
}