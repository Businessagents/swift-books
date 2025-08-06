import { defineConfig, createSystem } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: '#E6F3FF' },
          100: { value: '#B3DEFF' },
          200: { value: '#80C9FF' },
          300: { value: '#4DB4FF' },
          400: { value: '#1A9FFF' },
          500: { value: '#2B6CB0' },
          600: { value: '#225896' },
          700: { value: '#19447C' },
          800: { value: '#103062' },
          900: { value: '#071C48' },
        },
        secondary: {
          50: { value: '#EDF2F7' },
          100: { value: '#E2E8F0' },
          200: { value: '#CBD5E0' },
          300: { value: '#A0AEC0' },
          400: { value: '#718096' },
          500: { value: '#1A365D' },
          600: { value: '#152E4F' },
          700: { value: '#112641' },
          800: { value: '#0D1E33' },
          900: { value: '#081625' },
        },
        success: {
          50: { value: '#F0FFF4' },
          100: { value: '#C6F6D5' },
          200: { value: '#9AE6B4' },
          300: { value: '#68D391' },
          400: { value: '#48BB78' },
          500: { value: '#38A169' },
          600: { value: '#2F855A' },
          700: { value: '#276749' },
          800: { value: '#22543D' },
          900: { value: '#1C4532' },
        },
        gray: {
          50: { value: '#F7FAFC' },
          100: { value: '#EDF2F7' },
          200: { value: '#E2E8F0' },
          300: { value: '#CBD5E0' },
          400: { value: '#A0AEC0' },
          500: { value: '#718096' },
          600: { value: '#4A5568' },
          700: { value: '#2D3748' },
          800: { value: '#1A202C' },
          900: { value: '#171923' },
        },
      },
    },
  },
})

const theme = createSystem(config)

export default theme