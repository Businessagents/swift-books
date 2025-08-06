import { Eye, EyeOff } from "lucide-react"
import { IconButton } from "@chakra-ui/react"
import { usePrivacy } from "@/hooks/use-privacy"

export function PrivacyToggle() {
  const { isPrivacyMode, togglePrivacy } = usePrivacy()

  return (
    <IconButton
      aria-label="Toggle privacy mode"
      variant="ghost"
      size="sm"
      onClick={togglePrivacy}
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: 'scale(1.1)',
        bg: 'gray.100',
        _dark: { bg: 'gray.700' }
      }}
    >
      {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
    </IconButton>
  )
}