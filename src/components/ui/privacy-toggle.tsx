import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePrivacy } from "@/hooks/use-privacy"

export function PrivacyToggle() {
  const { isPrivacyMode, togglePrivacy } = usePrivacy()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={togglePrivacy}
      className="h-9 w-9 px-0"
    >
      {isPrivacyMode ? (
        <EyeOff className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Eye className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle privacy mode</span>
    </Button>
  )
}