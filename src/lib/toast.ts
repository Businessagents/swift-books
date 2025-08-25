/**
 * SwiftBooks Toast Utilities
 * 
 * Canadian SMB accounting software toast notifications
 * Using Ant Design notification system for consistent UX
 */

import { notification } from 'antd'
import type { NotificationPlacement } from 'antd/es/notification/interface'

// Canadian-themed toast configuration
const defaultConfig = {
  placement: 'topRight' as NotificationPlacement,
  duration: 4.5,
  style: {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  }
}

export interface ToastOptions {
  title?: string
  message: string
  duration?: number
  placement?: NotificationPlacement
  onClick?: () => void
}

// Success toast (Canadian green theme)
export const showSuccessToast = (options: ToastOptions) => {
  notification.success({
    message: options.title || 'Success',
    description: options.message,
    duration: options.duration || defaultConfig.duration,
    placement: options.placement || defaultConfig.placement,
    style: {
      ...defaultConfig.style,
      borderLeft: '4px solid #52c41a'
    },
    onClick: options.onClick
  })
}

// Error toast (Canadian red theme)
export const showErrorToast = (options: ToastOptions) => {
  notification.error({
    message: options.title || 'Error',
    description: options.message,
    duration: options.duration || defaultConfig.duration,
    placement: options.placement || defaultConfig.placement,
    style: {
      ...defaultConfig.style,
      borderLeft: '4px solid #ff4d4f'
    },
    onClick: options.onClick
  })
}

// Warning toast
export const showWarningToast = (options: ToastOptions) => {
  notification.warning({
    message: options.title || 'Warning',
    description: options.message,
    duration: options.duration || defaultConfig.duration,
    placement: options.placement || defaultConfig.placement,
    style: {
      ...defaultConfig.style,
      borderLeft: '4px solid #faad14'
    },
    onClick: options.onClick
  })
}

// Info toast
export const showInfoToast = (options: ToastOptions) => {
  notification.info({
    message: options.title || 'Info',
    description: options.message,
    duration: options.duration || defaultConfig.duration,
    placement: options.placement || defaultConfig.placement,
    style: {
      ...defaultConfig.style,
      borderLeft: '4px solid #1890ff'
    },
    onClick: options.onClick
  })
}

// Canadian compliance notification
export const showComplianceToast = (options: ToastOptions) => {
  notification.open({
    message: options.title || 'Canadian Compliance',
    description: options.message,
    duration: options.duration || 6, // Longer for compliance messages
    placement: options.placement || defaultConfig.placement,
    style: {
      ...defaultConfig.style,
      borderLeft: '4px solid #722ed1',
      backgroundColor: '#f9f0ff'
    },
    onClick: options.onClick
  })
}

// Tax calculation notification (GST/HST/PST)
export const showTaxToast = (options: ToastOptions) => {
  notification.open({
    message: options.title || 'Tax Calculation',
    description: options.message,
    duration: options.duration || 5,
    placement: options.placement || defaultConfig.placement,
    style: {
      ...defaultConfig.style,
      borderLeft: '4px solid #13c2c2',
      backgroundColor: '#e6fffb'
    },
    onClick: options.onClick
  })
}

// Convenience functions with simplified API
export const toast = {
  success: (message: string, title?: string) => showSuccessToast({ message, title }),
  error: (message: string, title?: string) => showErrorToast({ message, title }),
  warning: (message: string, title?: string) => showWarningToast({ message, title }),
  info: (message: string, title?: string) => showInfoToast({ message, title }),
  compliance: (message: string, title?: string) => showComplianceToast({ message, title }),
  tax: (message: string, title?: string) => showTaxToast({ message, title })
}

export default toast
