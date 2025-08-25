// SwiftBooks Privacy Hook - Canadian PIPEDA Compliance
import { useState, useEffect } from 'react'

interface PrivacySettings {
  showSensitiveData: boolean
  maskFinancialData: boolean
  enableDataEncryption: boolean
  auditDataAccess: boolean
  consentGiven: boolean
  dataRetentionPeriod: number // in months
}

interface UsePrivacyReturn {
  privacySettings: PrivacySettings
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void
  maskValue: (value: string | number, mask?: boolean) => string
  isDataVisible: (dataType: 'financial' | 'personal' | 'sensitive') => boolean
  logDataAccess: (dataType: string, action: string) => void
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  showSensitiveData: false,
  maskFinancialData: true,
  enableDataEncryption: true,
  auditDataAccess: true,
  consentGiven: false,
  dataRetentionPeriod: 84, // 7 years as per Canadian business records requirements
}

export const usePrivacy = (): UsePrivacyReturn => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS)

  useEffect(() => {
    // Load privacy settings from localStorage
    const savedSettings = localStorage.getItem('swiftbooks-privacy-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setPrivacySettings({ ...DEFAULT_PRIVACY_SETTINGS, ...parsed })
      } catch (error) {
        console.error('Failed to parse privacy settings:', error)
      }
    }
  }, [])

  const updatePrivacySettings = (newSettings: Partial<PrivacySettings>) => {
    const updated = { ...privacySettings, ...newSettings }
    setPrivacySettings(updated)
    
    // Save to localStorage
    localStorage.setItem('swiftbooks-privacy-settings', JSON.stringify(updated))
    
    // Log privacy setting change for audit purposes
    logDataAccess('privacy-settings', 'update')
  }

  const maskValue = (value: string | number, mask?: boolean): string => {
    const shouldMask = mask !== undefined ? mask : privacySettings.maskFinancialData
    
    if (!shouldMask) {
      return typeof value === 'number' ? value.toString() : value
    }

    const stringValue = typeof value === 'number' ? value.toString() : value
    
    // For financial values, show only the first and last character
    if (typeof value === 'number' || /^\$?[\d,.-]+$/.test(stringValue)) {
      if (stringValue.length <= 2) return '***'
      return `${stringValue[0]}${'*'.repeat(Math.max(0, stringValue.length - 2))}${stringValue[stringValue.length - 1]}`
    }
    
    // For other sensitive data, mask the middle portion
    if (stringValue.length <= 4) return '***'
    return `${stringValue.substring(0, 2)}${'*'.repeat(stringValue.length - 4)}${stringValue.substring(stringValue.length - 2)}`
  }

  const isDataVisible = (dataType: 'financial' | 'personal' | 'sensitive'): boolean => {
    switch (dataType) {
      case 'financial':
        return !privacySettings.maskFinancialData
      case 'sensitive':
        return privacySettings.showSensitiveData
      case 'personal':
        return privacySettings.showSensitiveData
      default:
        return true
    }
  }

  const logDataAccess = (dataType: string, action: string) => {
    if (!privacySettings.auditDataAccess) return

    const auditEntry = {
      timestamp: new Date().toISOString(),
      dataType,
      action,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // In a real implementation, this would be sent to an audit service
    console.log('Data Access Audit:', auditEntry)
    
    // Store audit trail locally for demonstration
    const auditLog = JSON.parse(localStorage.getItem('swiftbooks-audit-log') || '[]')
    auditLog.push(auditEntry)
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
      auditLog.splice(0, auditLog.length - 1000)
    }
    
    localStorage.setItem('swiftbooks-audit-log', JSON.stringify(auditLog))
  }

  return {
    privacySettings,
    updatePrivacySettings,
    maskValue,
    isDataVisible,
    logDataAccess,
  }
}

export default usePrivacy
