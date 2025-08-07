import { createSystem, defineConfig } from '@chakra-ui/react'

// Define the color scheme with the specified colors
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Primary: Trust Blue (#2B6CB0)
        primary: {
          50: { value: '#E6F3FF' },
          100: { value: '#B3DEFF' },
          200: { value: '#80C9FF' },
          300: { value: '#4DB4FF' },
          400: { value: '#1A9FFF' },
          500: { value: '#2B6CB0' }, // Main primary color
          600: { value: '#225896' },
          700: { value: '#19447C' },
          800: { value: '#103062' },
          900: { value: '#071C48' },
        },
        // Secondary: Dark Blue (#1A365D)
        secondary: {
          50: { value: '#EDF2F7' },
          100: { value: '#E2E8F0' },
          200: { value: '#CBD5E0' },
          300: { value: '#A0AEC0' },
          400: { value: '#718096' },
          500: { value: '#1A365D' }, // Main secondary color
          600: { value: '#152E4F' },
          700: { value: '#112641' },
          800: { value: '#0D1E33' },
          900: { value: '#081625' },
        },
        // Success: Green (#38A169)
        success: {
          50: { value: '#F0FFF4' },
          100: { value: '#C6F6D5' },
          200: { value: '#9AE6B4' },
          300: { value: '#68D391' },
          400: { value: '#48BB78' },
          500: { value: '#38A169' }, // Main success color
          600: { value: '#2F855A' },
          700: { value: '#276749' },
          800: { value: '#22543D' },
          900: { value: '#1C4532' },
        },
      },
      fonts: {
        heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        body: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
      },
    },
  },
})

const theme = createSystem(config)

export default theme