/**
 * SwiftBooks Canadian Tax Engine
 * 
 * Comprehensive Canadian tax calculations for SMB accounting
 * Supports GST/HST, Provincial Sales Tax, and business compliance
 * Built for security-first Canadian compliance requirements
 */

export interface CanadianProvince {
  code: string;
  name: string;
  gstRate: number;
  pstRate: number;
  hstRate: number;
  useHST: boolean;
}

export interface TaxCalculationResult {
  subtotal: number;
  gstAmount: number;
  pstAmount: number;
  hstAmount: number;
  totalTax: number;
  total: number;
  province: string;
  breakdown: TaxBreakdown[];
}

export interface TaxBreakdown {
  taxType: 'GST' | 'PST' | 'HST';
  rate: number;
  amount: number;
  description: string;
}

// Canadian provinces and territories with current tax rates (2025)
export const CANADIAN_PROVINCES: Record<string, CanadianProvince> = {
  AB: { // Alberta
    code: 'AB',
    name: 'Alberta',
    gstRate: 0.05,
    pstRate: 0.00,
    hstRate: 0.00,
    useHST: false
  },
  BC: { // British Columbia
    code: 'BC',
    name: 'British Columbia',
    gstRate: 0.05,
    pstRate: 0.07,
    hstRate: 0.00,
    useHST: false
  },
  MB: { // Manitoba
    code: 'MB',
    name: 'Manitoba',
    gstRate: 0.05,
    pstRate: 0.07,
    hstRate: 0.00,
    useHST: false
  },
  NB: { // New Brunswick
    code: 'NB',
    name: 'New Brunswick',
    gstRate: 0.00,
    pstRate: 0.00,
    hstRate: 0.15,
    useHST: true
  },
  NL: { // Newfoundland and Labrador
    code: 'NL',
    name: 'Newfoundland and Labrador',
    gstRate: 0.00,
    pstRate: 0.00,
    hstRate: 0.15,
    useHST: true
  },
  NS: { // Nova Scotia
    code: 'NS',
    name: 'Nova Scotia',
    gstRate: 0.00,
    pstRate: 0.00,
    hstRate: 0.15,
    useHST: true
  },
  NT: { // Northwest Territories
    code: 'NT',
    name: 'Northwest Territories',
    gstRate: 0.05,
    pstRate: 0.00,
    hstRate: 0.00,
    useHST: false
  },
  NU: { // Nunavut
    code: 'NU',
    name: 'Nunavut',
    gstRate: 0.05,
    pstRate: 0.00,
    hstRate: 0.00,
    useHST: false
  },
  ON: { // Ontario
    code: 'ON',
    name: 'Ontario',
    gstRate: 0.00,
    pstRate: 0.00,
    hstRate: 0.13,
    useHST: true
  },
  PE: { // Prince Edward Island
    code: 'PE',
    name: 'Prince Edward Island',
    gstRate: 0.00,
    pstRate: 0.00,
    hstRate: 0.15,
    useHST: true
  },
  QC: { // Quebec
    code: 'QC',
    name: 'Quebec',
    gstRate: 0.05,
    pstRate: 0.09975, // QST rate
    hstRate: 0.00,
    useHST: false
  },
  SK: { // Saskatchewan
    code: 'SK',
    name: 'Saskatchewan',
    gstRate: 0.05,
    pstRate: 0.06,
    hstRate: 0.00,
    useHST: false
  },
  YT: { // Yukon
    code: 'YT',
    name: 'Yukon',
    gstRate: 0.05,
    pstRate: 0.00,
    hstRate: 0.00,
    useHST: false
  }
};

/**
 * Calculate Canadian taxes for a given amount and province
 */
export function calculateCanadianTax(
  subtotal: number,
  provinceCode: string
): TaxCalculationResult {
  const province = CANADIAN_PROVINCES[provinceCode.toUpperCase()];
  
  if (!province) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }

  const breakdown: TaxBreakdown[] = [];
  let gstAmount = 0;
  let pstAmount = 0;
  let hstAmount = 0;

  if (province.useHST) {
    // HST provinces (combines GST and PST)
    hstAmount = roundToTwoDecimals(subtotal * province.hstRate);
    breakdown.push({
      taxType: 'HST',
      rate: province.hstRate,
      amount: hstAmount,
      description: `${province.name} HST (${(province.hstRate * 100).toFixed(1)}%)`
    });
  } else {
    // GST + PST provinces
    if (province.gstRate > 0) {
      gstAmount = roundToTwoDecimals(subtotal * province.gstRate);
      breakdown.push({
        taxType: 'GST',
        rate: province.gstRate,
        amount: gstAmount,
        description: `GST (${(province.gstRate * 100).toFixed(1)}%)`
      });
    }

    if (province.pstRate > 0) {
      // Quebec PST (QST) is calculated on subtotal + GST
      const pstBase = province.code === 'QC' ? subtotal + gstAmount : subtotal;
      pstAmount = roundToTwoDecimals(pstBase * province.pstRate);
      
      const pstLabel = province.code === 'QC' ? 'QST' : 'PST';
      breakdown.push({
        taxType: 'PST',
        rate: province.pstRate,
        amount: pstAmount,
        description: `${province.name} ${pstLabel} (${(province.pstRate * 100).toFixed(2)}%)`
      });
    }
  }

  const totalTax = gstAmount + pstAmount + hstAmount;
  const total = subtotal + totalTax;

  return {
    subtotal: roundToTwoDecimals(subtotal),
    gstAmount: roundToTwoDecimals(gstAmount),
    pstAmount: roundToTwoDecimals(pstAmount),
    hstAmount: roundToTwoDecimals(hstAmount),
    totalTax: roundToTwoDecimals(totalTax),
    total: roundToTwoDecimals(total),
    province: province.name,
    breakdown
  };
}

/**
 * Get GST/HST rate for a province
 */
export function getGSTHSTRate(provinceCode: string): number {
  const province = CANADIAN_PROVINCES[provinceCode.toUpperCase()];
  if (!province) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }
  
  return province.useHST ? province.hstRate : province.gstRate;
}

/**
 * Get PST rate for a province
 */
export function getPSTRate(provinceCode: string): number {
  const province = CANADIAN_PROVINCES[provinceCode.toUpperCase()];
  if (!province) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }
  
  return province.useHST ? 0 : province.pstRate;
}

/**
 * Check if a province uses HST
 */
export function isHSTProvince(provinceCode: string): boolean {
  const province = CANADIAN_PROVINCES[provinceCode.toUpperCase()];
  if (!province) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }
  
  return province.useHST;
}

/**
 * Format currency for Canadian accounting display
 */
export function formatCanadianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format currency for French Canadian accounting display
 */
export function formatCanadianCurrencyFrench(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Round to two decimal places for financial calculations
 */
function roundToTwoDecimals(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Validate Canadian Business Number (BN)
 * Format: 123456789RT0001
 */
export function validateCanadianBusinessNumber(bn: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanBN = bn.replace(/\s/g, '').toUpperCase();
  
  // Check format: 9 digits + 2 letters + 4 digits
  const bnRegex = /^(\d{9})([A-Z]{2})(\d{4})$/;
  const match = cleanBN.match(bnRegex);
  
  if (!match) {
    return false;
  }

  const [, businessNumber, programType, referenceNumber] = match;
  
  // Validate the 9-digit business number using check digit algorithm
  return validateBusinessNumberCheckDigit(businessNumber);
}

/**
 * Validate the check digit for Canadian Business Number
 */
function validateBusinessNumberCheckDigit(businessNumber: string): boolean {
  const weights = [1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    let product = parseInt(businessNumber[i]) * weights[i];
    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(businessNumber[8]);
}

/**
 * Get all Canadian provinces for dropdown/select components
 */
export function getAllCanadianProvinces(): CanadianProvince[] {
  return Object.values(CANADIAN_PROVINCES);
}

/**
 * Calculate quarterly GST/HST remittance based on sales
 */
export interface QuarterlyGSTCalculation {
  quarter: string;
  year: number;
  totalSales: number;
  totalGSTHSTCollected: number;
  totalGSTHSTPaid: number;
  netGSTHSTOwing: number;
  province: string;
}

export function calculateQuarterlyGST(
  sales: Array<{ amount: number; gstCollected: number; gstPaid: number }>,
  quarter: string,
  year: number,
  provinceCode: string
): QuarterlyGSTCalculation {
  const province = CANADIAN_PROVINCES[provinceCode.toUpperCase()];
  
  if (!province) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalGSTHSTCollected = sales.reduce((sum, sale) => sum + sale.gstCollected, 0);
  const totalGSTHSTPaid = sales.reduce((sum, sale) => sum + sale.gstPaid, 0);
  const netGSTHSTOwing = totalGSTHSTCollected - totalGSTHSTPaid;

  return {
    quarter,
    year,
    totalSales: roundToTwoDecimals(totalSales),
    totalGSTHSTCollected: roundToTwoDecimals(totalGSTHSTCollected),
    totalGSTHSTPaid: roundToTwoDecimals(totalGSTHSTPaid),
    netGSTHSTOwing: roundToTwoDecimals(netGSTHSTOwing),
    province: province.name
  };
}

/**
 * Export default object for easier imports
 */
export default {
  calculateCanadianTax,
  getGSTHSTRate,
  getPSTRate,
  isHSTProvince,
  formatCanadianCurrency,
  formatCanadianCurrencyFrench,
  validateCanadianBusinessNumber,
  getAllCanadianProvinces,
  calculateQuarterlyGST,
  CANADIAN_PROVINCES
};
