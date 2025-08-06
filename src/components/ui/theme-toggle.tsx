import * as React from "react"
import { IconButton } from "@chakra-ui/react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  // Simple state-based theme toggle for compatibility
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
             window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  const toggleColorMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    
    if (typeof window !== 'undefined') {
      if (newMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('chakra-ui-color-mode', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('chakra-ui-color-mode', 'light')
      }
    }
  }

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={isDark ? <Sun size={20} /> : <Moon size={20} />}
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: 'scale(1.1)',
        bg: isDark ? 'gray.700' : 'gray.100'
      }}
    />
  )
}