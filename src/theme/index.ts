// Simplified theme for Chakra UI v3
// In v3, the theming system has changed significantly
// This provides basic configuration for the system

const theme = {
  colors: {
    // Primary: Trust Blue (#2B6CB0)
    primary: {
      50: '#E6F3FF',
      100: '#B3DEFF',
      200: '#80C9FF',
      300: '#4DB4FF',
      400: '#1A9FFF',
      500: '#2B6CB0', // Main primary color
      600: '#225896',
      700: '#19447C',
      800: '#103062',
      900: '#071C48',
    },
    // Secondary: Dark Blue (#1A365D)
    secondary: {
      50: '#EDF2F7',
      100: '#E2E8F0',
      200: '#CBD5E0',
      300: '#A0AEC0',
      400: '#718096',
      500: '#1A365D', // Main secondary color
      600: '#152E4F',
      700: '#112641',
      800: '#0D1E33',
      900: '#081625',
    },
    // Success: Green (#38A169)
    success: {
      50: '#F0FFF4',
      100: '#C6F6D5',
      200: '#9AE6B4',
      300: '#68D391',
      400: '#48BB78',
      500: '#38A169', // Main success color
      600: '#2F855A',
      700: '#276749',
      800: '#22543D',
      900: '#1C4532',
    },
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
}

export default theme