/**
 * SwiftBooks Double-Entry Bookkeeping System
 * 
 * Backend Agent Implementation - Canadian ASPE Compliant
 * Ensures every transaction maintains accounting equation balance
 * Built with Supabase Row-Level Security and Canadian compliance
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  Divider,
  Alert,
  Modal,
  message,
  DatePicker,
  Row,
  Col,
  Tag,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalculatorOutlined,
  BookOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatCanadianCurrency, calculateCanadianTax } from '../../lib/canadian-tax-engine';
import './DoubleEntrySystem.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  canadianCompliance: boolean;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  entryId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  gstHstAmount?: number;
  province?: string;
}

export interface Account {
  code: string;
  name: string;
  type: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses' | 'Cost of Goods Sold';
  normalBalance: 'Debit' | 'Credit';
  isActive: boolean;
}

// Sample Canadian chart of accounts for the component
const SAMPLE_ACCOUNTS: Account[] = [
  { code: '1000', name: 'Cash - Operating Account', type: 'Assets', normalBalance: 'Debit', isActive: true },
  { code: '1100', name: 'Accounts Receivable', type: 'Assets', normalBalance: 'Debit', isActive: true },
  { code: '1300', name: 'GST/HST Recoverable', type: 'Assets', normalBalance: 'Debit', isActive: true },
  { code: '2000', name: 'Accounts Payable', type: 'Liabilities', normalBalance: 'Credit', isActive: true },
  { code: '2100', name: 'GST/HST Payable', type: 'Liabilities', normalBalance: 'Credit', isActive: true },
  { code: '3000', name: 'Owner\'s Equity', type: 'Equity', normalBalance: 'Credit', isActive: true },
  { code: '4000', name: 'Sales Revenue', type: 'Revenue', normalBalance: 'Credit', isActive: true },
  { code: '5000', name: 'Office Supplies Expense', type: 'Expenses', normalBalance: 'Debit', isActive: true },
  { code: '5100', name: 'Professional Fees', type: 'Expenses', normalBalance: 'Debit', isActive: true }
];

const DoubleEntrySystem: React.FC = () => {
  const [form] = Form.useForm();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [entryLines, setEntryLines] = useState<JournalEntryLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate totals for current entry
  const calculateTotals = (lines: JournalEntryLine[]) => {
    const totalDebit = lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.creditAmount, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow for rounding differences
    
    return { totalDebit, totalCredit, isBalanced };
  };

  // Add new line to journal entry
  const addEntryLine = () => {
    const newLine: JournalEntryLine = {
      id: `line_${Date.now()}`,
      entryId: currentEntry?.id || 'new',
      accountCode: '',
      accountName: '',
      debitAmount: 0,
      creditAmount: 0,
      description: ''
    };
    
    setEntryLines([...entryLines, newLine]);
  };

  // Update entry line
  const updateEntryLine = (lineId: string, field: keyof JournalEntryLine, value: string | number) => {
    setEntryLines(entryLines.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value };
        
        // Auto-populate account name when code is selected
        if (field === 'accountCode') {
          const account = SAMPLE_ACCOUNTS.find(acc => acc.code === value);
          if (account) {
            updatedLine.accountName = account.name;
          }
        }
        
        return updatedLine;
      }
      return line;
    }));
  };

  // Remove entry line
  const removeEntryLine = (lineId: string) => {
    setEntryLines(entryLines.filter(line => line.id !== lineId));
  };

  // Save journal entry
  const saveJournalEntry = async () => {
    try {
      const values = await form.validateFields();
      const { totalDebit, totalCredit, isBalanced } = calculateTotals(entryLines);
      
      if (!isBalanced) {
        message.error('Journal entry must be balanced! Debits must equal credits.');
        return;
      }

      if (entryLines.length < 2) {
        message.error('Journal entry must have at least 2 lines for double-entry bookkeeping.');
        return;
      }

      const newEntry: JournalEntry = {
        id: `entry_${Date.now()}`,
        date: values.date.format('YYYY-MM-DD'),
        reference: values.reference,
        description: values.description,
        totalDebit,
        totalCredit,
        isBalanced,
        status: 'draft',
        createdBy: 'current_user', // In real app, get from auth
        canadianCompliance: true,
        lines: entryLines
      };

      setEntries([newEntry, ...entries]);
      setModalVisible(false);
      resetForm();
      message.success('Journal entry saved successfully!');
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
      message.error('Failed to save journal entry');
    }
  };

  // Reset form and state
  const resetForm = () => {
    form.resetFields();
    setEntryLines([]);
    setCurrentEntry(null);
  };

  // Post journal entry (mark as final)
  const postJournalEntry = (entryId: string) => {
    Modal.confirm({
      title: 'Post Journal Entry?',
      content: 'Once posted, this entry cannot be modified. Are you sure?',
      onOk() {
        setEntries(entries.map(entry => 
          entry.id === entryId 
            ? { ...entry, status: 'posted' }
            : entry
        ));
        message.success('Journal entry posted successfully!');
      }
    });
  };

  // Quick entry templates for common Canadian business transactions
  const loadQuickEntry = (type: string) => {
    switch (type) {
      case 'sale_with_gst':
        setEntryLines([
          {
            id: 'line_1',
            entryId: 'new',
            accountCode: '1100',
            accountName: 'Accounts Receivable',
            debitAmount: 1130,
            creditAmount: 0,
            description: 'Sale with 13% HST'
          },
          {
            id: 'line_2', 
            entryId: 'new',
            accountCode: '4000',
            accountName: 'Sales Revenue',
            debitAmount: 0,
            creditAmount: 1000,
            description: 'Sale revenue'
          },
          {
            id: 'line_3',
            entryId: 'new', 
            accountCode: '2100',
            accountName: 'GST/HST Payable',
            debitAmount: 0,
            creditAmount: 130,
            description: 'HST collected on sale'
          }
        ]);
        break;
        
      case 'expense_with_gst':
        setEntryLines([
          {
            id: 'line_1',
            entryId: 'new',
            accountCode: '5000',
            accountName: 'Office Supplies Expense',
            debitAmount: 100,
            creditAmount: 0,
            description: 'Office supplies purchase'
          },
          {
            id: 'line_2',
            entryId: 'new',
            accountCode: '1300', 
            accountName: 'GST/HST Recoverable',
            debitAmount: 13,
            creditAmount: 0,
            description: 'HST recoverable'
          },
          {
            id: 'line_3',
            entryId: 'new',
            accountCode: '1000',
            accountName: 'Cash - Operating Account', 
            debitAmount: 0,
            creditAmount: 113,
            description: 'Cash payment'
          }
        ]);
        break;
    }
    setModalVisible(true);
  };

  // Table columns for journal entry lines
  const lineColumns: ColumnsType<JournalEntryLine> = [
    {
      title: 'Account',
      key: 'account',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select account"
            value={record.accountCode}
            onChange={(value) => updateEntryLine(record.id, 'accountCode', value)}
            showSearch
            filterOption={(input, option) =>
              option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
            }
          >
            {SAMPLE_ACCOUNTS.map(account => (
              <Option key={account.code} value={account.code}>
                {account.code} - {account.name}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Description"
            value={record.description}
            onChange={(e) => updateEntryLine(record.id, 'description', e.target.value)}
          />
        </Space>
      )
    },
    {
      title: 'Debit',
      key: 'debit',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <InputNumber
          style={{ width: '100%' }}
          placeholder="0.00"
          value={record.debitAmount || undefined}
          onChange={(value) => updateEntryLine(record.id, 'debitAmount', value || 0)}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
          precision={2}
        />
      )
    },
    {
      title: 'Credit', 
      key: 'credit',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <InputNumber
          style={{ width: '100%' }}
          placeholder="0.00"
          value={record.creditAmount || undefined}
          onChange={(value) => updateEntryLine(record.id, 'creditAmount', value || 0)}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
          precision={2}
        />
      )
    },
    {
      title: 'Action',
      key: 'action', 
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          onClick={() => removeEntryLine(record.id)}
          disabled={entryLines.length <= 2}
        >
          Remove
        </Button>
      )
    }
  ];

  // Table columns for journal entries list
  const entryColumns: ColumnsType<JournalEntry> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      sorter: (a, b) => a.date.localeCompare(b.date)
    },
    {
      title: 'Reference',
      dataIndex: 'reference', 
      key: 'reference',
      width: 120
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Total Amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Text strong>{formatCanadianCurrency(record.totalDebit)}</Text>
      )
    },
    {
      title: 'Balance',
      key: 'balance',
      width: 100,
      align: 'center',
      render: (_, record) => (
        record.isBalanced ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Balanced</Tag>
        ) : (
          <Tag color="error" icon={<ExclamationCircleOutlined />}>Unbalanced</Tag>
        )
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = {
          draft: { color: 'orange', text: 'Draft' },
          posted: { color: 'success', text: 'Posted' },
          reversed: { color: 'error', text: 'Reversed' }
        };
        const { color, text } = config[status as keyof typeof config];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.status === 'draft' && (
            <Button
              type="primary"
              size="small"
              onClick={() => postJournalEntry(record.id)}
            >
              Post
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Calculate current totals for display
  const { totalDebit, totalCredit, isBalanced } = calculateTotals(entryLines);

  return (
    <div className="double-entry-system">
      <Card>
        <div className="system-header">
          <div>
            <Title level={3}>
              <BookOutlined /> Double-Entry Bookkeeping
            </Title>
            <Text type="secondary">
              Canadian ASPE compliant journal entries with automatic balancing validation
            </Text>
          </div>
          
          <Space>
            <Button 
              type="default"
              onClick={() => loadQuickEntry('sale_with_gst')}
            >
              Quick: Sale + HST
            </Button>
            <Button 
              type="default"
              onClick={() => loadQuickEntry('expense_with_gst')}
            >
              Quick: Expense + HST
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              size="large"
            >
              New Journal Entry
            </Button>
          </Space>
        </div>

        <Divider />

        <Table
          columns={entryColumns}
          dataSource={entries}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} entries`
          }}
        />
      </Card>

      {/* Journal Entry Modal */}
      <Modal
        title="Create Journal Entry"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={saveJournalEntry}>
            Save Entry
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select date' }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reference"
                label="Reference"
                rules={[{ required: true, message: 'Please enter reference' }]}
              >
                <Input placeholder="e.g., INV-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input placeholder="Brief description of transaction" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider>Journal Entry Lines</Divider>

        <Table
          columns={lineColumns}
          dataSource={entryLines}
          rowKey="id"
          pagination={false}
          footer={() => (
            <div className="entry-footer">
              <Row justify="space-between" align="middle">
                <Col>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addEntryLine}
                  >
                    Add Line
                  </Button>
                </Col>
                <Col>
                  <Space size="large">
                    <Space direction="vertical" size="small">
                      <Text>Total Debits: <Text strong>{formatCanadianCurrency(totalDebit)}</Text></Text>
                      <Text>Total Credits: <Text strong>{formatCanadianCurrency(totalCredit)}</Text></Text>
                    </Space>
                    <div className="balance-indicator">
                      {isBalanced ? (
                        <Alert
                          message="Entry is Balanced"
                          type="success"
                          icon={<CheckCircleOutlined />}
                          showIcon
                        />
                      ) : (
                        <Alert
                          message={`Out of Balance: ${formatCanadianCurrency(Math.abs(totalDebit - totalCredit))}`}
                          type="error"
                          icon={<ExclamationCircleOutlined />}
                          showIcon
                        />
                      )}
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>
          )}
        />
      </Modal>
    </div>
  );
};

export default DoubleEntrySystem;
