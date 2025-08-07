import { useColorMode } from "@chakra-ui/color-mode"

// Toast function will be created with createStandaloneToast in a separate utility
// For now, we'll export a placeholder that can be used
export const toast = (message: string | { title?: string; description?: string; status?: 'success' | 'error' | 'warning' | 'info' }) => {
  // This will be implemented as a utility function that doesn't require hooks
  console.log('Toast:', message)
}

// Toaster component - not needed with Chakra UI since toasts are managed globally
const Toaster = () => {
  return null // Chakra UI handles toasts through the ChakraProvider
}

export { Toaster }
