import type { ThemeConfig } from 'antd'

export const swiftBooksTheme: ThemeConfig = {
  token: {
    // Primary colors - Canadian red and professional blue
    colorPrimary: '#FF0000', // Canadian red
    colorPrimaryBg: '#FFF2F2',
    colorPrimaryBgHover: '#FFE6E6',
    colorPrimaryBorder: '#FFCCCC',
    colorPrimaryBorderHover: '#FF9999',
    colorPrimaryHover: '#FF3333',
    colorPrimaryActive: '#CC0000',
    colorPrimaryTextHover: '#FF3333',
    colorPrimaryText: '#FF0000',
    colorPrimaryTextActive: '#CC0000',

    // Success colors - Canadian nature green
    colorSuccess: '#228B22',
    colorSuccessBg: '#F6FFED',
    colorSuccessBorder: '#B7EB8F',
    
    // Warning colors
    colorWarning: '#FFA500',
    colorWarningBg: '#FFF7E6',
    colorWarningBorder: '#FFD591',
    
    // Error colors
    colorError: '#FF4D4F',
    colorErrorBg: '#FFF2F0',
    colorErrorBorder: '#FFCCC7',
    
    // Neutral colors
    colorTextBase: '#000000',
    colorBgBase: '#FFFFFF',
    
    // Font
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    
    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    
    // Line height
    lineHeight: 1.5715,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    
    // Control heights
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
    controlHeightXS: 16,
    
    // Layout
    paddingContentHorizontal: 24,
    paddingContentVertical: 16,
    
    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    // Layout components
    Layout: {
      headerBg: '#FFFFFF',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#001529',
      bodyBg: '#F5F5F5',
    },
    
    // Menu component
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#E6F7FF',
      itemHoverBg: '#F5F5F5',
      itemSelectedColor: '#FF0000',
      itemColor: '#000000D9',
      groupTitleColor: '#00000073',
    },
    
    // Button component
    Button: {
      primaryShadow: '0 2px 0 rgba(255, 0, 0, 0.045)',
      defaultShadow: '0 2px 0 rgba(0, 0, 0, 0.015)',
    },
    
    // Form components
    Form: {
      labelColor: '#000000D9',
      labelRequiredMarkColor: '#FF4D4F',
      labelFontSize: 14,
      itemMarginBottom: 24,
    },
    
    // Input component
    Input: {
      activeBorderColor: '#FF0000',
      hoverBorderColor: '#FF4D4F',
    },
    
    // Table component
    Table: {
      headerBg: '#FAFAFA',
      headerColor: '#000000D9',
      headerSortActiveBg: '#F5F5F5',
      bodySortBg: '#FAFAFA',
      rowHoverBg: '#F5F5F5',
      rowSelectedBg: '#E6F7FF',
      rowSelectedHoverBg: '#DCEFFD',
    },
    
    // Card component
    Card: {
      headerBg: 'transparent',
      headerFontSize: 16,
      headerFontSizeSM: 14,
      headerHeight: 56,
      headerHeightSM: 48,
      actionsBg: '#FAFAFA',
    },
    
    // Typography
    Typography: {
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
    },
  },
  algorithm: undefined, // Use default algorithm
}
