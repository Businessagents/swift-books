// SwiftBooks Canadian Theme for Ant Design
import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

const { darkAlgorithm } = theme

export const swiftBooksTheme: ThemeConfig = {
  token: {
    // Primary Colors - Canadian Red
    colorPrimary: '#d32f2f',
    colorPrimaryBg: '#fff1f0',
    colorPrimaryBgHover: '#ffe7e6',
    colorPrimaryBorder: '#ffb3b3',
    colorPrimaryBorderHover: '#ff8080',
    colorPrimaryHover: '#ff5252',
    colorPrimaryActive: '#b71c1c',
    colorPrimaryText: '#ffffff',
    
    // Success Colors - Canadian Green (for positive values)
    colorSuccess: '#2e7d32',
    colorSuccessBg: '#f1f8e9',
    colorSuccessBgHover: '#e8f5e8',
    colorSuccessBorder: '#a5d6a7',
    colorSuccessTextHover: '#1b5e20',
    
    // Warning Colors - Canadian Gold
    colorWarning: '#f57c00',
    colorWarningBg: '#fff8e1',
    colorWarningBgHover: '#ffecb3',
    colorWarningBorder: '#ffcc02',
    
    // Error Colors
    colorError: '#d32f2f',
    colorErrorBg: '#ffebee',
    colorErrorBgHover: '#ffcdd2',
    colorErrorBorder: '#ef5350',
    
    // Layout Colors
    colorBgLayout: '#fafafa',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    
    // Border & Divider
    colorBorder: '#e0e0e0',
    colorBorderSecondary: '#f0f0f0',
    
    // Text Colors
    colorText: '#262626',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#8c8c8c',
    colorTextQuaternary: '#bfbfbf',
    
    // Typography
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Spacing
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
    
    // Border Radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    
    // Shadows
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    
    // Canadian Business Specific
    colorLink: '#1976d2',
    colorLinkHover: '#1565c0',
    colorLinkActive: '#0d47a1',
    
    // Financial Colors
    colorFillTertiary: '#f5f5f5', // For financial tables
    colorBgTextHover: '#f0f0f0',
  },
  components: {
    // Button customizations
    Button: {
      borderRadius: 6,
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(211, 47, 47, 0.2)',
    },
    
    // Card customizations for financial data
    Card: {
      headerBg: '#fafafa',
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    
    // Table customizations for accounting
    Table: {
      headerBg: '#fafafa',
      headerSortActiveBg: '#f0f0f0',
      headerSortHoverBg: '#f5f5f5',
      bodySortBg: '#fafafa',
      rowSelectedBg: '#e3f2fd',
      rowSelectedHoverBg: '#bbdefb',
      rowHoverBg: '#f5f5f5',
    },
    
    // Form customizations for Canadian compliance
    Form: {
      labelRequiredMarkColor: '#d32f2f',
      labelColor: '#262626',
      labelFontSize: 14,
    },
    
    // Input customizations
    Input: {
      borderRadius: 6,
      paddingBlock: 8,
      paddingInline: 12,
    },
    
    // Select customizations
    Select: {
      borderRadius: 6,
      optionSelectedBg: '#e3f2fd',
      optionActiveBg: '#f3e5f5',
    },
    
    // Typography for financial reports
    Typography: {
      titleMarginBottom: 16,
      titleMarginTop: 0,
    },
    
    // Statistics for dashboard
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    
    // Progress bars for Canadian compliance indicators
    Progress: {
      defaultColor: '#d32f2f',
      remainingColor: '#f0f0f0',
    },
    
    // Tabs for multi-section reports
    Tabs: {
      titleFontSize: 14,
      cardBg: '#fafafa',
      itemColor: '#595959',
      itemSelectedColor: '#d32f2f',
      itemHoverColor: '#ff5252',
      inkBarColor: '#d32f2f',
    },
    
    // Badge for status indicators
    Badge: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    
    // Alert for Canadian compliance warnings
    Alert: {
      borderRadiusLG: 8,
      fontSizeLG: 14,
    },
    
    // Modal for detailed views
    Modal: {
      borderRadiusLG: 8,
      headerBg: '#fafafa',
    },
    
    // Drawer for navigation
    Drawer: {
      footerPaddingBlock: 16,
      footerPaddingInline: 24,
    },
  },
}

// Canadian specific theme variants
export const swiftBooksThemeCompact: ThemeConfig = {
  ...swiftBooksTheme,
  token: {
    ...swiftBooksTheme.token,
    fontSize: 12,
    marginSM: 8,
    margin: 12,
    marginMD: 16,
    marginLG: 20,
  },
}

// Dark theme for Canadian users (optional)
export const swiftBooksThemeDark: ThemeConfig = {
  ...swiftBooksTheme,
  algorithm: [darkAlgorithm],
  token: {
    ...swiftBooksTheme.token,
    colorPrimary: '#ff5252',
    colorBgLayout: '#141414',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#262626',
    colorText: '#ffffff',
    colorTextSecondary: '#d9d9d9',
    colorBorder: '#434343',
  },
}
