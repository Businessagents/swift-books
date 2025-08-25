// Canadian Chart of Accounts Constants
// Constants separated for react-refresh compatibility

export type AccountType = 
  | 'Assets'
  | 'Liabilities' 
  | 'Equity'
  | 'Revenue'
  | 'Expenses'
  | 'Cost of Goods Sold';

export interface Account {
  id?: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: string;
  balance: number;
  isActive: boolean;
  canadianCompliance?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Canadian standard account structure following ASPE
export const CANADIAN_ACCOUNT_TYPES: Record<AccountType, {
  code: string;
  description: string;
  subtypes: string[];
  color: string;
}> = {
  'Assets': {
    code: '1000-1999',
    description: 'Economic resources owned by the business',
    subtypes: ['Current Assets', 'Non-Current Assets', 'Fixed Assets', 'Intangible Assets'],
    color: '#1890ff'
  },
  'Liabilities': {
    code: '2000-2999', 
    description: 'Debts and obligations owed by the business',
    subtypes: ['Current Liabilities', 'Long-term Liabilities', 'Deferred Liabilities'],
    color: '#ff4d4f'
  },
  'Equity': {
    code: '3000-3999',
    description: 'Owner\'s interest in the business',
    subtypes: ['Capital', 'Retained Earnings', 'Drawings', 'Share Capital'],
    color: '#52c41a'
  },
  'Revenue': {
    code: '4000-4999',
    description: 'Income earned from business operations',
    subtypes: ['Sales Revenue', 'Service Revenue', 'Interest Income', 'Other Revenue'],
    color: '#722ed1'
  },
  'Expenses': {
    code: '5000-5999',
    description: 'Costs incurred in business operations',
    subtypes: ['Operating Expenses', 'Administrative Expenses', 'Selling Expenses'],
    color: '#fa8c16'
  },
  'Cost of Goods Sold': {
    code: '6000-6999',
    description: 'Direct costs of producing goods sold',
    subtypes: ['Materials', 'Labor', 'Manufacturing Overhead'],
    color: '#eb2f96'
  }
};

// Default Canadian Chart of Accounts template
export const CANADIAN_DEFAULT_ACCOUNTS: Omit<Account, 'id' | 'created_at' | 'updated_at'>[] = [
  // Assets
  { code: '1000', name: 'Cash - Operating Account', type: 'Assets', subtype: 'Current Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1010', name: 'Cash - Savings Account', type: 'Assets', subtype: 'Current Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1100', name: 'Accounts Receivable', type: 'Assets', subtype: 'Current Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1110', name: 'Allowance for Doubtful Accounts', type: 'Assets', subtype: 'Current Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1200', name: 'Inventory', type: 'Assets', subtype: 'Current Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1300', name: 'Prepaid Expenses', type: 'Assets', subtype: 'Current Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1500', name: 'Equipment', type: 'Assets', subtype: 'Fixed Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1510', name: 'Accumulated Depreciation - Equipment', type: 'Assets', subtype: 'Fixed Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1600', name: 'Vehicles', type: 'Assets', subtype: 'Fixed Assets', balance: 0, isActive: true, canadianCompliance: true },
  { code: '1610', name: 'Accumulated Depreciation - Vehicles', type: 'Assets', subtype: 'Fixed Assets', balance: 0, isActive: true, canadianCompliance: true },

  // Liabilities
  { code: '2000', name: 'Accounts Payable', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2100', name: 'GST/HST Payable', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2110', name: 'PST Payable', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2200', name: 'Payroll Liabilities', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2210', name: 'CPP Payable', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2220', name: 'EI Payable', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2230', name: 'Income Tax Payable', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2300', name: 'Accrued Expenses', type: 'Liabilities', subtype: 'Current Liabilities', balance: 0, isActive: true, canadianCompliance: true },
  { code: '2500', name: 'Long-term Debt', type: 'Liabilities', subtype: 'Long-term Liabilities', balance: 0, isActive: true, canadianCompliance: true },

  // Equity
  { code: '3000', name: 'Owner\'s Capital', type: 'Equity', subtype: 'Capital', balance: 0, isActive: true, canadianCompliance: true },
  { code: '3100', name: 'Retained Earnings', type: 'Equity', subtype: 'Retained Earnings', balance: 0, isActive: true, canadianCompliance: true },
  { code: '3200', name: 'Owner\'s Drawings', type: 'Equity', subtype: 'Drawings', balance: 0, isActive: true, canadianCompliance: true },

  // Revenue
  { code: '4000', name: 'Sales Revenue', type: 'Revenue', subtype: 'Sales Revenue', balance: 0, isActive: true, canadianCompliance: true },
  { code: '4100', name: 'Service Revenue', type: 'Revenue', subtype: 'Service Revenue', balance: 0, isActive: true, canadianCompliance: true },
  { code: '4200', name: 'Interest Income', type: 'Revenue', subtype: 'Interest Income', balance: 0, isActive: true, canadianCompliance: true },
  { code: '4900', name: 'Other Revenue', type: 'Revenue', subtype: 'Other Revenue', balance: 0, isActive: true, canadianCompliance: true },

  // Expenses
  { code: '5000', name: 'Rent Expense', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5100', name: 'Utilities Expense', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5200', name: 'Office Supplies Expense', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5300', name: 'Advertising Expense', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5400', name: 'Professional Fees', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5500', name: 'Insurance Expense', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5600', name: 'Depreciation Expense', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5700', name: 'Bank Charges', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },
  { code: '5800', name: 'Travel Expense', type: 'Expenses', subtype: 'Operating Expenses', balance: 0, isActive: true, canadianCompliance: true },

  // Cost of Goods Sold
  { code: '6000', name: 'Cost of Goods Sold', type: 'Cost of Goods Sold', subtype: 'Materials', balance: 0, isActive: true, canadianCompliance: true },
  { code: '6100', name: 'Direct Labor', type: 'Cost of Goods Sold', subtype: 'Labor', balance: 0, isActive: true, canadianCompliance: true },
  { code: '6200', name: 'Manufacturing Overhead', type: 'Cost of Goods Sold', subtype: 'Manufacturing Overhead', balance: 0, isActive: true, canadianCompliance: true },
];
