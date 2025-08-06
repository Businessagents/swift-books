import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Banking = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the new Ledger page
    navigate('/ledger', { replace: true })
  }, [navigate])

  // This component will immediately redirect, but we return null as a fallback
  return null
}

export default Banking