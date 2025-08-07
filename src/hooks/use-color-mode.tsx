import { useState, useEffect } from 'react'

// Simple color mode hook for Chakra UI v3 compatibility
export function useColorMode() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('chakra-ui-color-mode')
    if (stored) return stored as 'light' | 'dark'
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newMode)
    localStorage.setItem('chakra-ui-color-mode', newMode)
    
    // Apply to document
    document.documentElement.setAttribute('data-theme', newMode)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode)
  }, [colorMode])

  return {
    colorMode,
    toggleColorMode,
    setColorMode
  }
}
