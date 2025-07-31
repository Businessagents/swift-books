import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface PrivacyContextType {
  isPrivacyMode: boolean
  togglePrivacy: () => void
  maskValue: (value: string | number) => string
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("privacy-mode")
    if (stored) {
      setIsPrivacyMode(JSON.parse(stored))
    }
  }, [])

  const togglePrivacy = () => {
    const newValue = !isPrivacyMode
    setIsPrivacyMode(newValue)
    localStorage.setItem("privacy-mode", JSON.stringify(newValue))
  }

  const maskValue = (value: string | number) => {
    if (!isPrivacyMode) return String(value)
    
    if (typeof value === "number") {
      return "••••••"
    }
    
    // Mask text but preserve structure
    return value.toString().replace(/./g, "•")
  }

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider")
  }
  return context
}