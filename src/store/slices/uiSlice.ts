import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  locale: 'en' | 'fr'
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  loading: boolean
  notifications: Notification[]
  breadcrumbs: BreadcrumbItem[]
}

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface BreadcrumbItem {
  key: string
  title: string
  href?: string
}

const initialState: UIState = {
  locale: 'en',
  theme: 'light',
  sidebarCollapsed: false,
  loading: false,
  notifications: [],
  breadcrumbs: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<'en' | 'fr'>) => {
      state.locale = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      }
      state.notifications.unshift(notification)
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload
    },
  },
})

export const {
  setLocale,
  setTheme,
  setSidebarCollapsed,
  setLoading,
  addNotification,
  markNotificationRead,
  removeNotification,
  setBreadcrumbs,
} = uiSlice.actions

export default uiSlice.reducer
export type { Notification, BreadcrumbItem }
