// SwiftBooks Canadian SMB Dashboard - Enhanced for Canadian Accounting
import React, { useState, useEffect } from 'react'
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Divider,
  Badge,
  Alert,
  Tooltip,
  ConfigProvider,
  theme
} from 'antd'
import {
  DollarOutlined,
  FileTextOutlined,
  BankOutlined,
  PieChartOutlined,
  CalendarOutlined,
  AlertOutlined,
  TrophyOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectCurrentCompany } from '@/store/slices/companySlice'
import { useGetTransactionsQuery, useGetAccountsQuery } from '@/store/api/supabaseApi'
import { formatCurrency, calculateGSTHST } from '@/lib/canadian-tax-engine'

const { Content } = Layout
const { Title, Text } = Typography
const { useToken } = theme

interface DashboardMetrics {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  gstHstOwed: number
  receivablesTotal: number
  payablesTotal: number
  cashFlow: number
  quarterlyGrowth: number
}

interface RecentTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  gstHstAmount?: number
  category: string
}

export const Dashboard: React.FC = () => {
  const { token } = useToken()
  const dispatch = useAppDispatch()
  const currentCompany = useAppSelector(selectCurrentCompany)
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    gstHstOwed: 0,
    receivablesTotal: 0,
    payablesTotal: 0,
    cashFlow: 0,
    quarterlyGrowth: 0
  })

  // Fetch data with Canadian tax calculations
  const { data: transactions, isLoading: transactionsLoading } = useGetTransactionsQuery({
    companyId: currentCompany?.id || '',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(), // Year to date
    endDate: new Date().toISOString()
  })

  const { data: accounts, isLoading: accountsLoading } = useGetAccountsQuery({
    companyId: currentCompany?.id || ''
  })

  // Calculate Canadian-specific metrics
  useEffect(() => {
    if (transactions && accounts && currentCompany) {
      const revenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      const gstHst = transactions.reduce((sum, t) => {
        const taxAmount = calculateGSTHST(t.amount, currentCompany.province || 'ON')
        return sum + taxAmount.total
      }, 0)

      const receivables = accounts
        ?.filter(a => a.type === 'receivable')
        .reduce((sum, a) => sum + (a.balance || 0), 0) || 0

      const payables = accounts
        ?.filter(a => a.type === 'payable')
        .reduce((sum, a) => sum + (a.balance || 0), 0) || 0

      setMetrics({
        totalRevenue: revenue,
        totalExpenses: expenses,
        netIncome: revenue - expenses,
        gstHstOwed: gstHst,
        receivablesTotal: receivables,
        payablesTotal: payables,
        cashFlow: revenue - expenses + receivables - payables,
        quarterlyGrowth: 12.5 // Placeholder - would calculate from historical data
      })
    }
  }, [transactions, accounts, currentCompany])

  // Sample recent transactions
  const recentTransactions: RecentTransaction[] = transactions?.slice(0, 5).map(t => ({
    id: t.id,
    date: new Date(t.date).toLocaleDateString('en-CA'),
    description: t.description || 'Transaction',
    amount: t.amount,
    type: t.type as 'income' | 'expense',
    gstHstAmount: currentCompany ? calculateGSTHST(t.amount, currentCompany.province || 'ON').total : 0,
    category: t.category || 'General'
  })) || []

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Badge color="blue" text={category} />
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number, record: RecentTransaction) => (
        <Text strong style={{ 
          color: record.type === 'income' ? token.colorSuccess : token.colorError 
        }}>
          {record.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(amount))}
        </Text>
      )
    },
    {
      title: 'GST/HST',
      dataIndex: 'gstHstAmount',
      key: 'gstHstAmount',
      width: 100,
      align: 'right' as const,
      render: (amount: number) => (
        <Text type="secondary">
          {formatCurrency(amount)}
        </Text>
      )
    }
  ]

  const quickActions = [
    { title: 'Record Sale', icon: <DollarOutlined />, color: 'green' },
    { title: 'Add Expense', icon: <FileTextOutlined />, color: 'red' },
    { title: 'Create Invoice', icon: <BankOutlined />, color: 'blue' },
    { title: 'Generate Report', icon: <PieChartOutlined />, color: 'purple' }
  ]

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 8,
        },
      }}
    >
      <Content style={{ padding: '24px', minHeight: '100vh', backgroundColor: token.colorBgLayout }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={0}>
                <Title level={2} style={{ margin: 0 }}>
                  Dashboard
                  <Tooltip title="Canadian Compliance Ready">
                    <GlobalOutlined style={{ marginLeft: 8, color: token.colorPrimary }} />
                  </Tooltip>
                </Title>
                <Text type="secondary">
                  {currentCompany?.name || 'Your Business'} • {new Date().toLocaleDateString('en-CA')}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<CalendarOutlined />}>
                  This Quarter
                </Button>
                <Button icon={<AlertOutlined />}>
                  Tax Reminders
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Canadian Tax Alert */}
        {metrics.gstHstOwed > 1000 && (
          <Alert
            message="GST/HST Reminder"
            description={`You have ${formatCurrency(metrics.gstHstOwed)} in GST/HST to remit. Next filing deadline is approaching.`}
            type="warning"
            showIcon
            closable
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* Key Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={metrics.totalRevenue}
                precision={2}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined style={{ color: token.colorSuccess }} />}
                valueStyle={{ color: token.colorSuccess }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Expenses"
                value={metrics.totalExpenses}
                precision={2}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<FileTextOutlined style={{ color: token.colorError }} />}
                valueStyle={{ color: token.colorError }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Net Income"
                value={metrics.netIncome}
                precision={2}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<TrophyOutlined style={{ color: token.colorPrimary }} />}
                valueStyle={{ 
                  color: metrics.netIncome >= 0 ? token.colorSuccess : token.colorError 
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="GST/HST Owed"
                value={metrics.gstHstOwed}
                precision={2}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<BankOutlined style={{ color: token.colorWarning }} />}
                valueStyle={{ color: token.colorWarning }}
              />
            </Card>
          </Col>
        </Row>

        {/* Secondary Metrics & Quick Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Cash Flow Overview" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Receivables"
                    value={metrics.receivablesTotal}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Payables"
                    value={metrics.payablesTotal}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ fontSize: '16px', color: token.colorError }}
                  />
                </Col>
              </Row>
              <Divider />
              <Progress
                percent={Math.max(0, (metrics.cashFlow / (metrics.totalRevenue || 1)) * 100)}
                strokeColor={metrics.cashFlow >= 0 ? token.colorSuccess : token.colorError}
                format={() => `Cash Flow: ${formatCurrency(metrics.cashFlow)}`}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Quick Actions" size="small">
              <Row gutter={[8, 8]}>
                {quickActions.map((action, index) => (
                  <Col span={12} key={index}>
                    <Button
                      block
                      icon={action.icon}
                      style={{ 
                        height: '60px',
                        borderColor: token.colorBorder,
                        color: token.colorText
                      }}
                    >
                      {action.title}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title="Recent Transactions" 
              size="small"
              extra={
                <Button type="link" size="small">
                  View All
                </Button>
              }
            >
              <Table
                dataSource={recentTransactions}
                columns={transactionColumns}
                pagination={false}
                size="small"
                loading={transactionsLoading || accountsLoading}
                rowKey="id"
                locale={{
                  emptyText: 'No transactions yet. Start by recording your first sale or expense.'
                }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </ConfigProvider>
  )
}

export default Dashboard
