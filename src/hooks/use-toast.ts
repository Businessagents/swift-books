import { createToaster } from "@chakra-ui/react"

// Create a toast instance using Chakra UI v3 API
const toaster = createToaster({
  placement: "top-right",
})

// Use Chakra UI's createToaster API 
export const useToast = () => {
  return toaster.create
}

// For backward compatibility with existing API
export const toast = toaster.create
