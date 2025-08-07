import { createToaster } from "@chakra-ui/react"

// Create a toaster instance
const toaster = createToaster({
  placement: "top-right",
})

// Create a unified toast interface that matches both shadcn and Chakra patterns
export const useToast = () => {
  return {
    toast: (options: {
      title?: string
      description?: string
      status?: 'success' | 'error' | 'warning' | 'info'
      duration?: number
      isClosable?: boolean
    }) => {
      toaster.create({
        title: options.title,
        description: options.description,
        status: options.status || 'info',
        duration: options.duration || 5000,
        isClosable: options.isClosable !== false,
      })
    }
  }
}

// Legacy toast function for compatibility
export const toast = (options: string | {
  title?: string
  description?: string
  status?: 'success' | 'error' | 'warning' | 'info'
}) => {
  if (typeof options === 'string') {
    toaster.create({
      description: options,
      status: 'info',
    })
  } else {
    toaster.create({
      title: options.title,
      description: options.description,
      status: options.status || 'info',
    })
  }
}
