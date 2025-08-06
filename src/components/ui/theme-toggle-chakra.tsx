import * as React from "react"
import { IconButton, useColorMode } from "@chakra-ui/react"
import { Moon, Sun } from "lucide-react"

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      onClick={toggleColorMode}
      variant="ghost"
      size="md"
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: 'scale(1.1)',
        bg: colorMode === 'light' ? 'gray.100' : 'gray.700'
      }}
    />
  )
}

export { ThemeToggle }