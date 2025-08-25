/**
 * SwiftBooks Chart of Accounts Component
 * 
 * Canadian accounting standards compliant Chart of Accounts
 * Following ASPE (Accounting Standards for Private Enterprises)
 * Built with Ant Design v5 and Canadian compliance
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Space,
  Tag,
  Typography,
  Tooltip,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { formatCanadianCurrency } from '../../lib/canadian-tax-engine';
import { 
  CANADIAN_ACCOUNT_TYPES, 
  CANADIAN_DEFAULT_ACCOUNTS,
  type AccountType,
  type Account
} from '../../lib/canadian-accounting-constants';
import './ChartOfAccounts.css';

const { Title, Text } = Typography;
const { Option } = Select;






const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // In a real application, this would load from Supabase
      // For now, we'll use the default Canadian accounts
      const defaultAccounts: Account[] = CANADIAN_DEFAULT_ACCOUNTS.map((account, index) => ({
        ...account,
        id: `account_${index + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      setAccounts(defaultAccounts);
    } catch (error) {
      message.error('Failed to load chart of accounts');
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setModalVisible(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      // In a real application, this would delete from Supabase
      setAccounts(accounts.filter(account => account.id !== accountId));
      message.success('Account deleted successfully');
    } catch (error) {
      message.error('Failed to delete account');
      console.error('Error deleting account:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAccount) {
        // Update existing account
        const updatedAccount: Account = {
          ...editingAccount,
          ...values,
          updated_at: new Date().toISOString()
        };
        
        setAccounts(accounts.map(account => 
          account.id === editingAccount.id ? updatedAccount : account
        ));
        message.success('Account updated successfully');
      } else {
        // Add new account
        const newAccount: Account = {
          id: `account_${Date.now()}`,
          ...values,
          balance: values.balance || 0,
          canadianCompliance: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setAccounts([...accounts, newAccount]);
        message.success('Account added successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<Account> = [
    {
      title: 'Account Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (code) => <Text strong>{code}</Text>
    },
    {
      title: 'Account Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <Text>{name}</Text>
          {record.canadianCompliance && (
            <Tooltip title="Canadian Compliance Verified">
              <Tag color="green">🍁 CA</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      filters: Object.keys(CANADIAN_ACCOUNT_TYPES).map(type => ({
        text: type,
        value: type
      })),
      onFilter: (value, record) => record.type === value,
      render: (type: AccountType) => (
        <Tag color={CANADIAN_ACCOUNT_TYPES[type].color}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Subtype',
      dataIndex: 'subtype',
      key: 'subtype',
      width: 150,
      render: (subtype) => <Text type="secondary">{subtype}</Text>
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.balance - b.balance,
      render: (balance) => (
        <Text strong style={{ color: balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatCanadianCurrency(balance)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditAccount(record)}
            title="Edit Account"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAccount(record.id)}
            title="Delete Account"
          />
        </Space>
      )
    }
  ];

  return (
    <div className="chart-of-accounts">
      <Card>
        <div className="chart-header">
          <div>
            <Title level={3}>
              <DollarOutlined /> Chart of Accounts
            </Title>
            <Text type="secondary">
              Canadian ASPE-compliant chart of accounts for your business
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAccount}
            size="large"
          >
            Add Account
          </Button>
        </div>

        <Divider />

        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} accounts`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="code"
            label="Account Code"
            rules={[
              { required: true, message: 'Please enter account code' },
              { pattern: /^\d{4}$/, message: 'Account code must be 4 digits' }
            ]}
          >
            <Input placeholder="e.g., 1000" maxLength={4} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Account Name"
            rules={[{ required: true, message: 'Please enter account name' }]}
          >
            <Input placeholder="e.g., Cash - Operating Account" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Account Type"
            rules={[{ required: true, message: 'Please select account type' }]}
          >
            <Select placeholder="Select account type">
              {Object.entries(CANADIAN_ACCOUNT_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Space>
                    <Tag color={value.color}>{key}</Tag>
                    <Text type="secondary">({value.code})</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subtype"
            label="Subtype"
            rules={[{ required: true, message: 'Please enter subtype' }]}
          >
            <Input placeholder="e.g., Current Assets" />
          </Form.Item>

          <Form.Item
            name="balance"
            label="Opening Balance"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              placeholder="0.00"
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Optional description for this account"
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChartOfAccounts;
