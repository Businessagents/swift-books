/**
 * SwiftBooks Mobile Detection Hook
 * 
 * Mobile-first responsive design utilities for Canadian SMB accounting
 * Supports both web and mobile app implementations
 */

import * as React from "react"

export interface MobileBreakpoints {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLandscape: boolean
  isPortrait: boolean
  screenWidth: number
  screenHeight: number
}

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  largeDesktop: 1600
} as const

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced mobile hook with Canadian business features
export const useMobile = (): MobileBreakpoints => {
  const [screenDimensions, setScreenDimensions] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  const [orientation, setOrientation] = React.useState({
    isLandscape: false,
    isPortrait: true
  })

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenDimensions({ width, height })
      setOrientation({
        isLandscape: width > height,
        isPortrait: height >= width
      })
    }

    handleResize() // Initial call
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = screenDimensions.width <= BREAKPOINTS.mobile
  const isTablet = screenDimensions.width > BREAKPOINTS.mobile && screenDimensions.width <= BREAKPOINTS.tablet
  const isDesktop = screenDimensions.width > BREAKPOINTS.tablet

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape: orientation.isLandscape,
    isPortrait: orientation.isPortrait,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height
  }
}

// Touch detection for mobile interactions
export const useTouch = () => {
  const [isTouch, setIsTouch] = React.useState(false)

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    
    checkTouch()
    window.addEventListener('touchstart', checkTouch)
    return () => window.removeEventListener('touchstart', checkTouch)
  }, [])

  return isTouch
}

// Canadian mobile-specific utilities
export const useCanadianMobile = () => {
  const mobile = useMobile()
  const isTouch = useTouch()

  // Canadian business hours detection
  const isCanadianBusinessHours = React.useMemo(() => {
    const now = new Date()
    const canadianTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Toronto"}))
    const hour = canadianTime.getHours()
    return hour >= 9 && hour <= 17 // 9 AM - 5 PM EST
  }, [])

  // Mobile-optimized Canadian currency formatting
  const formatCurrencyMobile = React.useCallback((amount: number) => {
    if (mobile.isMobile && Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M CAD`
    } else if (mobile.isMobile && Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K CAD`
    }
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }, [mobile.isMobile])

  return {
    ...mobile,
    isTouch,
    isBusinessHours: isCanadianBusinessHours,
    formatCurrency: formatCurrencyMobile
  }
}

export default useMobile
