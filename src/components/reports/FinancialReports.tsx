/**
 * SwiftBooks Canadian Financial Reports
 * 
 * QA Security Agent & Product Agent Implementation
 * Canadian ASPE compliant financial statements with CRA reporting
 * Built for Canadian SMB compliance and security validation
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Select,
  DatePicker,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
  Alert,
  Tag,
  Tooltip,
  Spin
} from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  CalendarOutlined,
  ExportOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatCanadianCurrency, getAllCanadianProvinces } from '../../lib/canadian-tax-engine';
import './FinancialReports.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export interface FinancialReportData {
  balanceSheet: BalanceSheetData;
  incomeStatement: IncomeStatementData;
  gstHstReport: GSTHSTReportData;
  trialBalance: TrialBalanceData[];
}

export interface BalanceSheetData {
  assets: {
    currentAssets: AccountBalance[];
    fixedAssets: AccountBalance[];
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: AccountBalance[];
    longTermLiabilities: AccountBalance[];
    totalLiabilities: number;
  };
  equity: {
    equity: AccountBalance[];
    totalEquity: number;
  };
}

export interface IncomeStatementData {
  revenue: AccountBalance[];
  totalRevenue: number;
  costOfGoodsSold: AccountBalance[];
  totalCOGS: number;
  grossProfit: number;
  expenses: AccountBalance[];
  totalExpenses: number;
  netIncome: number;
  period: string;
}

export interface GSTHSTReportData {
  reportingPeriod: string;
  province: string;
  salesSubject: number;
  gstHstCollected: number;
  purchasesSubject: number;
  gstHstPaid: number;
  netGstHst: number;
  adjustments: number;
  totalRemittance: number;
  canadianCompliance: boolean;
}

export interface AccountBalance {
  accountCode: string;
  accountName: string;
  balance: number;
  accountType: string;
}

export interface TrialBalanceData {
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  accountType: string;
}

const FinancialReports: React.FC = () => {
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('year'),
    dayjs().endOf('year')
  ]);
  const [selectedProvince, setSelectedProvince] = useState('ON');

  // Sample data for demonstration
  useEffect(() => {
    loadSampleReportData();
  }, []);

  const loadSampleReportData = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const sampleData: FinancialReportData = {
        balanceSheet: {
          assets: {
            currentAssets: [
              { accountCode: '1000', accountName: 'Cash - Operating', balance: 45000, accountType: 'Assets' },
              { accountCode: '1100', accountName: 'Accounts Receivable', balance: 23500, accountType: 'Assets' },
              { accountCode: '1300', accountName: 'GST/HST Recoverable', balance: 2340, accountType: 'Assets' }
            ],
            fixedAssets: [
              { accountCode: '1500', accountName: 'Equipment', balance: 85000, accountType: 'Assets' },
              { accountCode: '1510', accountName: 'Accumulated Depreciation', balance: -12000, accountType: 'Assets' }
            ],
            totalAssets: 143840
          },
          liabilities: {
            currentLiabilities: [
              { accountCode: '2000', accountName: 'Accounts Payable', balance: 15600, accountType: 'Liabilities' },
              { accountCode: '2100', accountName: 'GST/HST Payable', balance: 4580, accountType: 'Liabilities' }
            ],
            longTermLiabilities: [
              { accountCode: '2500', accountName: 'Equipment Loan', balance: 35000, accountType: 'Liabilities' }
            ],
            totalLiabilities: 55180
          },
          equity: {
            equity: [
              { accountCode: '3000', accountName: 'Owner\'s Equity', balance: 50000, accountType: 'Equity' },
              { accountCode: '3100', accountName: 'Retained Earnings', balance: 38660, accountType: 'Equity' }
            ],
            totalEquity: 88660
          }
        },
        incomeStatement: {
          revenue: [
            { accountCode: '4000', accountName: 'Sales Revenue', balance: 245000, accountType: 'Revenue' },
            { accountCode: '4100', accountName: 'Service Revenue', balance: 48500, accountType: 'Revenue' }
          ],
          totalRevenue: 293500,
          costOfGoodsSold: [
            { accountCode: '6000', accountName: 'Cost of Materials', balance: 89200, accountType: 'COGS' },
            { accountCode: '6100', accountName: 'Direct Labour', balance: 67500, accountType: 'COGS' }
          ],
          totalCOGS: 156700,
          grossProfit: 136800,
          expenses: [
            { accountCode: '5000', accountName: 'Office Supplies', balance: 12400, accountType: 'Expenses' },
            { accountCode: '5100', accountName: 'Professional Fees', balance: 8900, accountType: 'Expenses' },
            { accountCode: '5200', accountName: 'Rent Expense', balance: 24000, accountType: 'Expenses' }
          ],
          totalExpenses: 45300,
          netIncome: 91500,
          period: '2025'
        },
        gstHstReport: {
          reportingPeriod: 'Q3 2025',
          province: 'Ontario',
          salesSubject: 293500,
          gstHstCollected: 38155,
          purchasesSubject: 156700,
          gstHstPaid: 20371,
          netGstHst: 17784,
          adjustments: 0,
          totalRemittance: 17784,
          canadianCompliance: true
        },
        trialBalance: [
          { accountCode: '1000', accountName: 'Cash - Operating', debitBalance: 45000, creditBalance: 0, accountType: 'Assets' },
          { accountCode: '1100', accountName: 'Accounts Receivable', debitBalance: 23500, creditBalance: 0, accountType: 'Assets' },
          { accountCode: '2000', accountName: 'Accounts Payable', debitBalance: 0, creditBalance: 15600, accountType: 'Liabilities' },
          { accountCode: '3000', accountName: 'Owner\'s Equity', debitBalance: 0, creditBalance: 50000, accountType: 'Equity' },
          { accountCode: '4000', accountName: 'Sales Revenue', debitBalance: 0, creditBalance: 245000, accountType: 'Revenue' }
        ]
      };
      
      setReportData(sampleData);
      setLoading(false);
    }, 1000);
  };

  // Balance Sheet Component
  const BalanceSheetReport: React.FC = () => {
    if (!reportData?.balanceSheet) return <Spin />;

    const { balanceSheet } = reportData;

    const balanceSheetColumns: ColumnsType<AccountBalance> = [
      {
        title: 'Account',
        key: 'account',
        render: (_, record) => (
          <Space>
            <Text>{record.accountCode}</Text>
            <Text strong>{record.accountName}</Text>
          </Space>
        )
      },
      {
        title: 'Amount',
        key: 'balance',
        align: 'right',
        render: (_, record) => (
          <Text strong style={{ color: record.balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {formatCanadianCurrency(Math.abs(record.balance))}
          </Text>
        )
      }
    ];

    return (
      <div className="balance-sheet-report">
        <div className="report-header">
          <Title level={4}>Balance Sheet</Title>
          <Text type="secondary">As of {dayjs().format('MMMM DD, YYYY')}</Text>
        </div>

        <Row gutter={24}>
          <Col span={12}>
            <Card title="Assets" className="assets-section">
              <div className="asset-category">
                <Title level={5}>Current Assets</Title>
                <Table
                  columns={balanceSheetColumns}
                  dataSource={balanceSheet.assets.currentAssets}
                  rowKey="accountCode"
                  pagination={false}
                  size="small"
                />
              </div>
              
              <div className="asset-category">
                <Title level={5}>Fixed Assets</Title>
                <Table
                  columns={balanceSheetColumns}
                  dataSource={balanceSheet.assets.fixedAssets}
                  rowKey="accountCode"
                  pagination={false}
                  size="small"
                />
              </div>
              
              <Divider />
              <Statistic
                title="Total Assets"
                value={balanceSheet.assets.totalAssets}
                formatter={(value) => formatCanadianCurrency(Number(value))}
                valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card title="Liabilities" className="liabilities-section">
                <div className="liability-category">
                  <Title level={5}>Current Liabilities</Title>
                  <Table
                    columns={balanceSheetColumns}
                    dataSource={balanceSheet.liabilities.currentLiabilities}
                    rowKey="accountCode"
                    pagination={false}
                    size="small"
                  />
                </div>
                
                <Divider />
                <Statistic
                  title="Total Liabilities"
                  value={balanceSheet.liabilities.totalLiabilities}
                  formatter={(value) => formatCanadianCurrency(Number(value))}
                  valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
                />
              </Card>

              <Card title="Equity" className="equity-section">
                <Table
                  columns={balanceSheetColumns}
                  dataSource={balanceSheet.equity.equity}
                  rowKey="accountCode"
                  pagination={false}
                  size="small"
                />
                
                <Divider />
                <Statistic
                  title="Total Equity"
                  value={balanceSheet.equity.totalEquity}
                  formatter={(value) => formatCanadianCurrency(Number(value))}
                  valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                />
              </Card>
            </Space>
          </Col>
        </Row>

        <Alert
          message="Balance Sheet Equation Check"
          description={`Assets (${formatCanadianCurrency(balanceSheet.assets.totalAssets)}) = Liabilities (${formatCanadianCurrency(balanceSheet.liabilities.totalLiabilities)}) + Equity (${formatCanadianCurrency(balanceSheet.equity.totalEquity)})`}
          type={Math.abs(balanceSheet.assets.totalAssets - (balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)) < 0.01 ? 'success' : 'error'}
          icon={Math.abs(balanceSheet.assets.totalAssets - (balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)) < 0.01 ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          style={{ marginTop: 24 }}
        />
      </div>
    );
  };

  // GST/HST Report Component
  const GSTHSTReport: React.FC = () => {
    if (!reportData?.gstHstReport) return <Spin />;

    const { gstHstReport } = reportData;

    return (
      <div className="gst-hst-report">
        <div className="report-header">
          <Title level={4}>GST/HST Return Report</Title>
          <Space>
            <Text type="secondary">{gstHstReport.reportingPeriod}</Text>
            <Tag color="green">🍁 {gstHstReport.province}</Tag>
          </Space>
        </div>

        <Card>
          <Row gutter={24}>
            <Col span={12}>
              <Card title="Sales and GST/HST Collected" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Total Sales Subject to GST/HST"
                    value={gstHstReport.salesSubject}
                    formatter={(value) => formatCanadianCurrency(Number(value))}
                  />
                  <Statistic
                    title="GST/HST Collected"
                    value={gstHstReport.gstHstCollected}
                    formatter={(value) => formatCanadianCurrency(Number(value))}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Purchases and GST/HST Paid" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Total Purchases Subject to GST/HST"
                    value={gstHstReport.purchasesSubject}
                    formatter={(value) => formatCanadianCurrency(Number(value))}
                  />
                  <Statistic
                    title="GST/HST Paid/Recoverable"
                    value={gstHstReport.gstHstPaid}
                    formatter={(value) => formatCanadianCurrency(Number(value))}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col span={12}>
              <Statistic
                title="Net GST/HST"
                value={gstHstReport.netGstHst}
                formatter={(value) => formatCanadianCurrency(Number(value))}
                valueStyle={{ 
                  color: gstHstReport.netGstHst > 0 ? '#ff4d4f' : '#52c41a',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
              <Text type="secondary">
                {gstHstReport.netGstHst > 0 ? 'Amount Owing to CRA' : 'Refund Due from CRA'}
              </Text>
            </Col>
            
            <Col span={12}>
              <Space direction="vertical">
                <Button type="primary" icon={<ExportOutlined />} size="large">
                  Export to CRA Format
                </Button>
                <Text type="secondary">
                  Ready for electronic filing with Canada Revenue Agency
                </Text>
              </Space>
            </Col>
          </Row>

          {gstHstReport.canadianCompliance && (
            <Alert
              message="CRA Compliance Verified"
              description="This GST/HST report meets all Canada Revenue Agency requirements for electronic filing."
              type="success"
              icon={<CheckCircleOutlined />}
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="financial-reports">
      <Card>
        <div className="reports-header">
          <div>
            <Title level={3}>
              <BarChartOutlined /> Financial Reports
            </Title>
            <Text type="secondary">
              Canadian ASPE compliant financial statements and CRA reporting
            </Text>
          </div>
          
          <Space>
            <Select
              value={selectedProvince}
              onChange={setSelectedProvince}
              style={{ width: 120 }}
            >
              {getAllCanadianProvinces().map(province => (
                <Option key={province.code} value={province.code}>
                  {province.code}
                </Option>
              ))}
            </Select>
            
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              format="YYYY-MM-DD"
            />
            
            <Button icon={<PrinterOutlined />}>
              Print
            </Button>
            <Button type="primary" icon={<ExportOutlined />}>
              Export PDF
            </Button>
          </Space>
        </div>

        <Divider />

        <Tabs defaultActiveKey="balance-sheet" size="large">
          <TabPane
            tab={
              <span>
                <DollarOutlined />
                Balance Sheet
              </span>
            }
            key="balance-sheet"
          >
            <BalanceSheetReport />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Income Statement
              </span>
            }
            key="income-statement"
          >
            <Alert
              message="Income Statement"
              description="Profit & Loss statement for the selected period - Coming in Stage 3"
              type="info"
              style={{ margin: '24px 0' }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                GST/HST Report
              </span>
            }
            key="gst-hst"
          >
            <GSTHSTReport />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                Trial Balance
              </span>
            }
            key="trial-balance"
          >
            <Alert
              message="Trial Balance"
              description="Detailed account balances report - Coming in Stage 3"
              type="info"
              style={{ margin: '24px 0' }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default FinancialReports;
