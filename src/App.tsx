import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { ConfigProvider, Layout, Typography, Menu } from 'antd';
import { 
  DashboardOutlined, 
  TransactionOutlined, 
  SettingOutlined, 
  BankOutlined, 
  BookOutlined, 
  BarChartOutlined,
  DollarOutlined,
  SyncOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { store } from './store';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import our SwiftBooks components - Core
import Dashboard from "./components/dashboard/Dashboard";
import TransactionManager from "./components/transactions/TransactionManager";
import ChartOfAccounts from "./components/accounting/ChartOfAccounts";
import DoubleEntrySystem from "./components/accounting/DoubleEntrySystem";
import FinancialReports from "./components/reports/FinancialReports";
import NotFound from "./pages/NotFound";

// Import Stage 3 Advanced Components
import BankingIntegration from "./components/banking/BankingIntegration";
import AdvancedInvoicing from "./components/invoices/AdvancedInvoicing";
import MultiCurrencyManager from "./components/reports/MultiCurrencyManager";
import AutomatedReconciliation from "./components/reports/AutomatedReconciliation";
import AdvancedReporting from "./components/reports/AdvancedReporting";

// Import Stage 3 styles
import './components/reports/reports.css';

const { Content, Sider } = Layout;
const { Title } = Typography;

const queryClient = new QueryClient();

// Canadian SwiftBooks theme configuration
const swiftBooksTheme = {
  token: {
    colorPrimary: '#d32f2f', // Canadian red
    colorSuccess: '#2e7d32',
    colorWarning: '#f57c00',
    colorError: '#c62828',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f5f5f5',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
    }
  }
};

function AppContent() {
  const navigate = useNavigate();

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'transactions':
        navigate('/transactions');
        break;
      case 'accounts':
        navigate('/accounts');
        break;
      case 'journal':
        navigate('/journal');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'banking':
        navigate('/banking');
        break;
      case 'invoicing':
        navigate('/invoicing');
        break;
      case 'currency':
        navigate('/currency');
        break;
      case 'reconciliation':
        navigate('/reconciliation');
        break;
      case 'advanced-reports':
        navigate('/advanced-reports');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: '#ffffff' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={3} style={{ color: '#d32f2f', margin: 0 }}>
            SwiftBooks
          </Title>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
            Canadian SMB Accounting
          </p>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          style={{ border: 'none' }}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'transactions',
              icon: <TransactionOutlined />,
              label: 'Transactions',
            },
            {
              key: 'accounts',
              icon: <BankOutlined />,
              label: 'Chart of Accounts',
            },
            {
              key: 'journal',
              icon: <BookOutlined />,
              label: 'Journal Entries',
            },
            {
              key: 'reports',
              icon: <BarChartOutlined />,
              label: 'Financial Reports',
            },
            {
              type: 'divider',
            },
            {
              key: 'stage3',
              label: 'Advanced Features',
              type: 'group',
              children: [
                {
                  key: 'banking',
                  icon: <BankOutlined />,
                  label: 'Banking Integration',
                },
                {
                  key: 'invoicing',
                  icon: <FileTextOutlined />,
                  label: 'Advanced Invoicing',
                },
                {
                  key: 'currency',
                  icon: <DollarOutlined />,
                  label: 'Multi-Currency',
                },
                {
                  key: 'reconciliation',
                  icon: <SyncOutlined />,
                  label: 'Auto Reconciliation',
                },
                {
                  key: 'advanced-reports',
                  icon: <BarChartOutlined />,
                  label: 'Advanced Reports',
                }
              ]
            },
            {
              type: 'divider',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Settings',
            }
          ]}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionManager />} />
            <Route path="/accounts" element={<ChartOfAccounts />} />
            <Route path="/journal" element={<DoubleEntrySystem />} />
            <Route path="/reports" element={<FinancialReports />} />
            
            {/* Stage 3 Advanced Features */}
            <Route path="/banking" element={<BankingIntegration />} />
            <Route path="/invoicing" element={<AdvancedInvoicing />} />
            <Route path="/currency" element={<MultiCurrencyManager />} />
            <Route path="/reconciliation" element={<AutomatedReconciliation />} />
            <Route path="/advanced-reports" element={<AdvancedReporting />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ConfigProvider theme={swiftBooksTheme}>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ConfigProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;