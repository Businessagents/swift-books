import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import enUS from 'antd/locale/en_US'
import frCA from 'antd/locale/fr_CA'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/fr-ca'
import App from './App.tsx'
import { store } from './store/store'
import { swiftBooksTheme } from './theme/swiftbooks-theme'
import './index.css'

// Set default locale
dayjs.locale('en')

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <IntlProvider locale="en" defaultLocale="en">
        <ConfigProvider 
          theme={swiftBooksTheme}
          locale={enUS}
        >
          <App />
        </ConfigProvider>
      </IntlProvider>
    </Provider>
  </React.StrictMode>
);
