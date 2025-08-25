// SwiftBooks Redux Store Configuration
import { configureStore } from '@reduxjs/toolkit'
import { supabaseApi } from './api/supabaseApi'
import authSlice from './slices/authSlice'
import companySlice from './slices/companySlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    company: companySlice,
    ui: uiSlice,
    [supabaseApi.reducerPath]: supabaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: [supabaseApi.reducerPath],
      },
    }).concat(supabaseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

export default store
