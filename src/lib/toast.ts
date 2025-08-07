import { createToaster } from "@chakra-ui/react"

// Create a toaster instance that can be used throughout the app
export const toaster = createToaster({
  placement: "top-right",
  pauseOnPageIdle: true,
})

// Utility function to show toasts
export const showToast = ({
  title,
  description,
  status = "info",
  duration = 5000,
  isClosable = true,
}: {
  title: string
  description?: string
  status?: "success" | "error" | "warning" | "info"
  duration?: number
  isClosable?: boolean
}) => {
  return toaster.create({
    title,
    description,
    status,
    duration,
    isClosable,
  })
}