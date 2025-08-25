// SwiftBooks Canadian Transaction Management - Enhanced for Canadian SMB
import React, { useState, useEffect } from 'react'
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Modal,
  Form,
  InputNumber,
  Radio,
  Tag,
  Tooltip,
  message,
  Popconfirm,
  Badge,
  Alert
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DollarOutlined,
  GlobalOutlined,
  CalculatorOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import './TransactionManager.css'

const { Content } = Layout
const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  account_id: string
  gst_hst_rate?: number
  gst_hst_amount?: number
  reference_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface TransactionFormData {
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  account_id: string
  date: dayjs.Dayjs
  gst_hst_applicable: boolean
  reference_number?: string
  notes?: string
}

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Travel & Entertainment',
  'Professional Services',
  'Marketing & Advertising',
  'Utilities',
  'Rent & Facilities',
  'Equipment & Software',
  'Insurance',
  'Telecommunications',
  'Vehicle Expenses',
  'Training & Development',
  'Other Business Expenses'
]

const INCOME_CATEGORIES = [
  'Product Sales',
  'Service Revenue',
  'Consulting Income',
  'Interest Income',
  'Investment Income',
  'Rental Income',
  'Other Income'
]

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Office supplies purchase',
    amount: 150.00,
    type: 'expense',
    category: 'Office Supplies',
    account_id: 'acc1',
    gst_hst_rate: 0.13,
    gst_hst_amount: 19.50,
    reference_number: 'INV-001',
    notes: 'Monthly office supplies',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    date: '2024-01-20',
    description: 'Client consultation',
    amount: 500.00,
    type: 'income',
    category: 'Consulting Income',
    account_id: 'acc1',
    gst_hst_rate: 0.13,
    gst_hst_amount: 65.00,
    reference_number: 'INV-002',
    notes: 'Project Alpha consultation',
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-01-20T14:00:00Z'
  }
]

const mockAccounts = [
  { id: 'acc1', name: 'Main Business Account' },
  { id: 'acc2', name: 'Petty Cash' },
  { id: 'acc3', name: 'Credit Card' }
]

// Simple currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Simple GST/HST calculator
const calculateGSTHST = (amount: number, province: string = 'ON') => {
  const rate = province === 'ON' ? 0.13 : 0.05 // Simplified
  return {
    rate,
    amount: amount * rate,
    total: amount + (amount * rate)
  }
}

export const TransactionManager: React.FC = () => {
  const [form] = Form.useForm<TransactionFormData>()
  
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)

  // Calculate GST/HST when form values change
  const [gstHstDetails, setGstHstDetails] = useState<{
    rate: number
    amount: number
    total: number
  }>({ rate: 0, amount: 0, total: 0 })

  const calculateTaxes = (amount: number, applicable: boolean) => {
    if (!applicable) {
      setGstHstDetails({ rate: 0, amount: 0, total: 0 })
      return
    }

    const taxCalc = calculateGSTHST(amount, 'ON')
    setGstHstDetails(taxCalc)
  }

  // Form submission
  const handleSubmit = async (values: TransactionFormData) => {
    try {
      const newTransaction: Transaction = {
        id: editingTransaction?.id || Date.now().toString(),
        description: values.description,
        amount: values.amount,
        type: values.type,
        category: values.category,
        account_id: values.account_id,
        date: values.date.toISOString(),
        gst_hst_rate: values.gst_hst_applicable ? gstHstDetails.rate : 0,
        gst_hst_amount: values.gst_hst_applicable ? gstHstDetails.amount : 0,
        reference_number: values.reference_number,
        notes: values.notes,
        created_at: editingTransaction?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (editingTransaction) {
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? newTransaction : t))
        message.success('Transaction updated successfully')
      } else {
        setTransactions(prev => [...prev, newTransaction])
        message.success('Transaction created successfully')
      }

      setIsModalVisible(false)
      setEditingTransaction(null)
      form.resetFields()
    } catch (error) {
      message.error('Failed to save transaction')
      console.error('Transaction save error:', error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    form.setFieldsValue({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      account_id: transaction.account_id,
      date: dayjs(transaction.date),
      gst_hst_applicable: (transaction.gst_hst_amount || 0) > 0,
      reference_number: transaction.reference_number,
      notes: transaction.notes
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setTransactions(prev => prev.filter(t => t.id !== id))
      message.success('Transaction deleted successfully')
    } catch (error) {
      message.error('Failed to delete transaction')
    }
  }

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string, record: Transaction) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.reference_number && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Ref: {record.reference_number}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Badge 
          status={type === 'income' ? 'success' : 'error'} 
          text={type.charAt(0).toUpperCase() + type.slice(1)}
        />
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number, record: Transaction) => (
        <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
          <Text 
            strong 
            style={{ 
              color: record.type === 'income' ? '#52c41a' : '#ff4d4f',
              fontSize: '14px'
            }}
          >
            {record.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(amount))}
          </Text>
          {(record.gst_hst_amount || 0) > 0 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              GST/HST: {formatCurrency(record.gst_hst_amount || 0)}
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record: Transaction) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete transaction"
            description="Are you sure you want to delete this transaction?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                size="small" 
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // Filter logic
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchText || 
      transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchText.toLowerCase()) ||
      (transaction.reference_number?.toLowerCase().includes(searchText.toLowerCase()))

    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter

    return matchesSearch && matchesType && matchesCategory
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalGstHst = filteredTransactions
    .reduce((sum, t) => sum + (t.gst_hst_amount || 0), 0)

  return (
    <Content style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0 }}>
                Transactions
                <Tooltip title="Canadian Tax Compliant">
                  <GlobalOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                </Tooltip>
              </Title>
              <Text type="secondary">
                Manage your income and expenses with automatic GST/HST calculations
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingTransaction(null)
                  form.resetFields()
                  setIsModalVisible(true)
                }}
              >
                Add Transaction
              </Button>
              <Button icon={<DownloadOutlined />}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '12px', color: '#52c41a', fontSize: '24px' }}>
                <DollarOutlined />
              </div>
              <div>
                <Text type="secondary">Total Income</Text>
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                  {formatCurrency(totalIncome)}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '12px', color: '#ff4d4f', fontSize: '24px' }}>
                <FileTextOutlined />
              </div>
              <div>
                <Text type="secondary">Total Expenses</Text>
                <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
                  {formatCurrency(totalExpenses)}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '12px', color: '#faad14', fontSize: '24px' }}>
                <CalculatorOutlined />
              </div>
              <div>
                <Text type="secondary">GST/HST Collected</Text>
                <Title level={4} style={{ margin: 0, color: '#faad14' }}>
                  {formatCurrency(totalGstHst)}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search transactions..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Types</Option>
              <Option value="income">Income</Option>
              <Option value="expense">Expense</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              format="MMM DD, YYYY"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => {
                setSearchText('')
                setDateRange(null)
                setTypeFilter('all')
                setCategoryFilter('all')
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card size="small">
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{
            total: filteredTransactions.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: 'No transactions found. Add your first transaction to get started.'
          }}
        />
      </Card>

      {/* Transaction Modal */}
      <Modal
        title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingTransaction(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'expense',
            date: dayjs(),
            gst_hst_applicable: false
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="MMM DD, YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please select a type' }]}
              >
                <Radio.Group>
                  <Radio.Button value="income">Income</Radio.Button>
                  <Radio.Button value="expense">Expense</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="Enter transaction description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter an amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  formatter={value => `$ ${value}`}
                  parser={value => Number(value?.replace(/\$\s?|(,*)/g, '')) || 0}
                  onChange={(value) => {
                    const gstApplicable = form.getFieldValue('gst_hst_applicable')
                    calculateTaxes(value || 0, gstApplicable)
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select placeholder="Select category">
                  <Select.OptGroup label="Income Categories">
                    {INCOME_CATEGORIES.map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    ))}
                  </Select.OptGroup>
                  <Select.OptGroup label="Expense Categories">
                    {EXPENSE_CATEGORIES.map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="account_id"
                label="Account"
                rules={[{ required: true, message: 'Please select an account' }]}
              >
                <Select placeholder="Select account">
                  {mockAccounts.map(account => (
                    <Option key={account.id} value={account.id}>
                      {account.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reference_number" label="Reference Number">
                <Input placeholder="Invoice #, Receipt #, etc." />
              </Form.Item>
            </Col>
          </Row>

          {/* GST/HST Section */}
          <Form.Item name="gst_hst_applicable" valuePropName="checked">
            <Space>
              <input
                type="checkbox"
                id="gst-checkbox"
                onChange={(e) => {
                  const amount = form.getFieldValue('amount') || 0
                  calculateTaxes(amount, e.target.checked)
                }}
              />
              <label htmlFor="gst-checkbox">GST/HST Applicable</label>
              <Tooltip title="Check if this transaction includes GST/HST">
                <GlobalOutlined />
              </Tooltip>
            </Space>
          </Form.Item>

          {gstHstDetails.amount > 0 && (
            <Alert
              message="GST/HST Calculation for Ontario"
              description={
                <Space direction="vertical" size={0}>
                  <Text>Rate: {(gstHstDetails.rate * 100).toFixed(1)}%</Text>
                  <Text>Tax Amount: {formatCurrency(gstHstDetails.amount)}</Text>
                  <Text strong>Total with Tax: {formatCurrency(gstHstDetails.total)}</Text>
                </Space>
              }
              type="info"
              showIcon
            />
          )}

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Additional notes (optional)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  )
}

export default TransactionManager
