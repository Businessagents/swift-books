import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store';
import { PrivacyProvider } from "@/hooks/use-privacy";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Index from "./pages/Index";
import AuthSimple from "./pages/AuthSimple";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Ledger from "./pages/Ledger";
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import our new components
import Dashboard from "./components/dashboard/Dashboard";
import TransactionManager from "./components/transactions/TransactionManager";

const queryClient = new QueryClient();

// Canadian theme configuration
const canadianTheme = {
  token: {
    colorPrimary: '#ff0000', // Canadian red
    colorSuccess: '#228B22',
    colorWarning: '#FFA500',
    colorError: '#DC143C',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
  },
};

const App = () => (
  <Provider store={store}>
    <ConfigProvider theme={canadianTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PrivacyProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthSimple />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionManager /></ProtectedRoute>} />
                <Route path="/ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
                {/* Legacy routes for backward compatibility */}
                <Route path="/expenses" element={<ProtectedRoute><TransactionManager /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/receipts" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/banking" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PrivacyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </Provider>
);

export default App;