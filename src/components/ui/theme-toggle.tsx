import * as React from "react"
import { IconButton } from "@chakra-ui/react"
import { useColorMode } from "@chakra-ui/color-mode"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <IconButton
      aria-label="Toggle theme"
    >
      {colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </IconButton>
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: 'scale(1.1)',
        bg: colorMode === 'light' ? 'gray.100' : 'gray.700'
      }}
    />
  )
}