import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivacyProvider } from "@/hooks/use-privacy";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Ledger from "./pages/Ledger";
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@chakra-ui/react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PrivacyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/expenses" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/receipts" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/banking" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </PrivacyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;