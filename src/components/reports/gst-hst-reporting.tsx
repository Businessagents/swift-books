import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/integrations/supabase/client"
import { usePrivacy } from "@/hooks/use-privacy"
import { showToast } from "@/lib/toast"
import { 
  Box,
  VStack,
  HStack,
  Flex,
  Heading,
  Text,
  Grid,
  GridItem,
  Spinner,
  Center,
  Stack
} from "@chakra-ui/react"
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Calculator, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart
} from "lucide-react"

// Canadian GST/HST rates by province
const TAX_RATES = {
  'AB': { gst: 5, pst: 0, hst: 0, name: 'Alberta' },
  'BC': { gst: 5, pst: 7, hst: 0, name: 'British Columbia' },
  'MB': { gst: 5, pst: 7, hst: 0, name: 'Manitoba' },
  'NB': { gst: 0, pst: 0, hst: 15, name: 'New Brunswick' },
  'NL': { gst: 0, pst: 0, hst: 15, name: 'Newfoundland and Labrador' },
  'NT': { gst: 5, pst: 0, hst: 0, name: 'Northwest Territories' },
  'NS': { gst: 0, pst: 0, hst: 15, name: 'Nova Scotia' },
  'NU': { gst: 5, pst: 0, hst: 0, name: 'Nunavut' },
  'ON': { gst: 0, pst: 0, hst: 13, name: 'Ontario' },
  'PE': { gst: 0, pst: 0, hst: 15, name: 'Prince Edward Island' },
  'QC': { gst: 5, pst: 9.975, hst: 0, name: 'Quebec' },
  'SK': { gst: 5, pst: 6, hst: 0, name: 'Saskatchewan' },
  'YT': { gst: 5, pst: 0, hst: 0, name: 'Yukon' }
}

const REPORTING_PERIODS = [
  { value: 'monthly', label: 'Monthly', deadlineOffset: 30 },
  { value: 'quarterly', label: 'Quarterly', deadlineOffset: 90 },
  { value: 'annually', label: 'Annually', deadlineOffset: 365 }
]

interface TaxData {
  period: string
  totalSales: number
  totalPurchases: number
  gstCollected: number
  gstPaid: number
  hstCollected: number
  hstPaid: number
  netTaxOwing: number
  refundDue: number
}

interface ExpenseData {
  id: string
  description: string
  vendor: string
  amount: number
  tax_amount: number
  expense_date: string
  category: { name: string }
}

interface InvoiceData {
  id: string
  invoice_number: string
  client_name: string
  total_amount: number
  tax_amount: number
  subtotal: number
  issue_date: string
}

export function GSTHSTReporting() {
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly')
  const [selectedProvince, setSelectedProvince] = useState('ON')
  const [reportYear, setReportYear] = useState(new Date().getFullYear())
  const [reportQuarter, setReportQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3))
  const [isExporting, setIsExporting] = useState(false)

  const { maskValue, isPrivacyMode } = usePrivacy()

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    const currentDate = new Date()
    let startDate: Date
    let endDate: Date

    switch (selectedPeriod) {
      case 'monthly':
        startDate = new Date(reportYear, currentDate.getMonth(), 1)
        endDate = new Date(reportYear, currentDate.getMonth() + 1, 0)
        break
      case 'quarterly':
        const quarterStartMonth = (reportQuarter - 1) * 3
        startDate = new Date(reportYear, quarterStartMonth, 1)
        endDate = new Date(reportYear, quarterStartMonth + 3, 0)
        break
      case 'annually':
        startDate = new Date(reportYear, 0, 1)
        endDate = new Date(reportYear, 11, 31)
        break
      default:
        startDate = new Date(reportYear, 0, 1)
        endDate = new Date(reportYear, 11, 31)
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    }
  }, [selectedPeriod, reportYear, reportQuarter])

  // Fetch expenses for the period
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['gst-expenses', dateRange.start, dateRange.end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          description,
          vendor,
          amount,
          tax_amount,
          expense_date,
          category:expense_categories(name)
        `)
        .gte('expense_date', dateRange.start)
        .lte('expense_date', dateRange.end)
        .order('expense_date', { ascending: false })

      if (error) throw error
      return data as ExpenseData[]
    }
  })

  // Fetch invoices for the period
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['gst-invoices', dateRange.start, dateRange.end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          client_name,
          total_amount,
          tax_amount,
          subtotal,
          issue_date
        `)
        .gte('issue_date', dateRange.start)
        .lte('issue_date', dateRange.end)
        .order('issue_date', { ascending: false })

      if (error) throw error
      return data as InvoiceData[]
    }
  })

  // Calculate tax summary
  const taxSummary = useMemo(() => {
    const totalSales = invoices.reduce((sum, inv) => sum + inv.subtotal, 0)
    const totalPurchases = expenses.reduce((sum, exp) => sum + (exp.amount - exp.tax_amount), 0)
    
    const taxRates = TAX_RATES[selectedProvince as keyof typeof TAX_RATES]
    
    // GST/HST collected on sales
    const gstCollected = invoices.reduce((sum, inv) => {
      if (taxRates.hst > 0) {
        return sum + (inv.subtotal * (taxRates.hst / 100))
      }
      return sum + (inv.subtotal * (taxRates.gst / 100))
    }, 0)

    // GST/HST paid on purchases
    const gstPaid = expenses.reduce((sum, exp) => sum + exp.tax_amount, 0)

    const netTaxOwing = Math.max(0, gstCollected - gstPaid)
    const refundDue = Math.max(0, gstPaid - gstCollected)

    return {
      totalSales,
      totalPurchases,
      gstCollected,
      gstPaid,
      netTaxOwing,
      refundDue,
      taxRates
    }
  }, [expenses, invoices, selectedProvince])

  // Calculate filing deadline
  const filingDeadline = useMemo(() => {
    const period = REPORTING_PERIODS.find(p => p.value === selectedPeriod)
    if (!period) return null

    const endDate = new Date(dateRange.end)
    const deadline = new Date(endDate)
    deadline.setDate(deadline.getDate() + period.deadlineOffset)
    
    const today = new Date()
    const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      date: deadline,
      daysUntil: daysUntilDeadline,
      isOverdue: daysUntilDeadline < 0,
      isUrgent: daysUntilDeadline <= 7 && daysUntilDeadline >= 0
    }
  }, [dateRange, selectedPeriod])

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      // Prepare data for export
      const csvData = [
        ['GST/HST Report'],
        ['Period:', `${selectedPeriod} - ${dateRange.start} to ${dateRange.end}`],
        ['Province:', TAX_RATES[selectedProvince as keyof typeof TAX_RATES].name],
        ['Generated:', new Date().toISOString().split('T')[0]],
        [''],
        ['Summary'],
        ['Total Sales (Before Tax)', taxSummary.totalSales.toFixed(2)],
        ['Total Purchases (Before Tax)', taxSummary.totalPurchases.toFixed(2)],
        ['GST/HST Collected', taxSummary.gstCollected.toFixed(2)],
        ['GST/HST Paid', taxSummary.gstPaid.toFixed(2)],
        ['Net Tax Owing', taxSummary.netTaxOwing.toFixed(2)],
        ['Refund Due', taxSummary.refundDue.toFixed(2)],
        [''],
        ['Sales Details'],
        ['Invoice Number', 'Client', 'Date', 'Subtotal', 'Tax', 'Total'],
        ...invoices.map(inv => [
          inv.invoice_number,
          inv.client_name,
          inv.issue_date,
          inv.subtotal.toFixed(2),
          inv.tax_amount.toFixed(2),
          inv.total_amount.toFixed(2)
        ]),
        [''],
        ['Purchase Details'],
        ['Description', 'Vendor', 'Date', 'Amount', 'Tax', 'Total'],
        ...expenses.map(exp => [
          exp.description,
          exp.vendor || '',
          exp.expense_date,
          (exp.amount - exp.tax_amount).toFixed(2),
          exp.tax_amount.toFixed(2),
          exp.amount.toFixed(2)
        ])
      ]

      // Convert to CSV string
      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `gst-hst-report-${dateRange.start}-to-${dateRange.end}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast({
        title: "Export Successful",
        description: "GST/HST report exported successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Export error:', error)
      showToast({
        title: "Export Failed",
        description: "Failed to export report",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = expensesLoading || invoicesLoading

  return (
    <VStack spacing={6} align="stretch">
      {/* Header and Controls */}
      <Flex 
        direction={{ base: "column", lg: "row" }} 
        gap={4} 
        align={{ base: "stretch", lg: "center" }} 
        justify="space-between"
      >
        <Box>
          <Heading size="xl" fontWeight="bold">GST/HST Reporting</Heading>
          <Text color="gray.600" _dark={{ color: "gray.400" }}>
            CRA-compliant tax reporting for Canadian businesses
          </Text>
        </Box>
        
        <Flex wrap="wrap" gap={3}>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger w="200px">
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TAX_RATES).map(([code, data]) => (
                <SelectItem key={code} value={code}>
                  {data.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger w="150px">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {REPORTING_PERIODS.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={reportYear.toString()} onValueChange={(value) => setReportYear(parseInt(value))}>
            <SelectTrigger w="120px">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPeriod === 'quarterly' && (
            <Select value={reportQuarter.toString()} onValueChange={(value) => setReportQuarter(parseInt(value))}>
              <SelectTrigger w="120px">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1</SelectItem>
                <SelectItem value="2">Q2</SelectItem>
                <SelectItem value="3">Q3</SelectItem>
                <SelectItem value="4">Q4</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button onClick={exportToCSV} disabled={isExporting || isLoading}>
            <Download size={16} style={{ marginRight: 8 }} />
            Export CSV
          </Button>
        </Flex>
      </Flex>

      {/* Filing Deadline Alert */}
      {filingDeadline && (
        <Alert 
          status={filingDeadline.isOverdue ? "error" : filingDeadline.isUrgent ? "warning" : "success"}
          borderLeftWidth="4px"
          borderLeftColor={filingDeadline.isOverdue ? "red.500" : filingDeadline.isUrgent ? "yellow.500" : "green.500"}
        >
          <AlertCircle size={16} />
          <AlertDescription>
            <Flex align="center" justify="space-between">
              <Text>
                {filingDeadline.isOverdue 
                  ? `Filing deadline was ${Math.abs(filingDeadline.daysUntil)} days ago`
                  : `Filing deadline: ${filingDeadline.date.toLocaleDateString('en-CA')} (${filingDeadline.daysUntil} days)`
                }
              </Text>
              {filingDeadline.isOverdue ? (
                <Badge variant="destructive">Overdue</Badge>
              ) : filingDeadline.isUrgent ? (
                <Badge variant="secondary">Urgent</Badge>
              ) : (
                <Badge variant="default">On Track</Badge>
              )}
            </Flex>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent pt={6}>
            <VStack spacing={3}>
              <HStack spacing={2}>
                <Spinner size="sm" color="primary.500" />
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                  Loading tax data...
                </Text>
              </HStack>
              <Progress value={66} size="sm" />
            </VStack>
          </CardContent>
        </Card>
      )}

      {!isLoading && (
        <>
          {/* Summary Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
            <Card>
              <CardHeader pb={2}>
                <Flex align="center" justify="space-between">
                  <CardTitle fontSize="sm" fontWeight="medium">Total Sales</CardTitle>
                  <TrendingUp size={16} color="gray.500" />
                </Flex>
              </CardHeader>
              <CardContent>
                <Text fontSize="2xl" fontWeight="bold">
                  ${isPrivacyMode ? maskValue(taxSummary.totalSales) : taxSummary.totalSales.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </Text>
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                  Before tax ({invoices.length} invoices)
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardHeader pb={2}>
                <Flex align="center" justify="space-between">
                  <CardTitle fontSize="sm" fontWeight="medium">Tax Collected</CardTitle>
                  <Calculator size={16} color="gray.500" />
                </Flex>
              </CardHeader>
              <CardContent>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${isPrivacyMode ? maskValue(taxSummary.gstCollected) : taxSummary.gstCollected.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </Text>
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                  {taxSummary.taxRates.hst > 0 ? `HST ${taxSummary.taxRates.hst}%` : `GST ${taxSummary.taxRates.gst}%`}
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardHeader pb={2}>
                <Flex align="center" justify="space-between">
                  <CardTitle fontSize="sm" fontWeight="medium">Tax Paid</CardTitle>
                  <Calculator size={16} color="gray.500" />
                </Flex>
              </CardHeader>
              <CardContent>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  ${isPrivacyMode ? maskValue(taxSummary.gstPaid) : taxSummary.gstPaid.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </Text>
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                  On purchases ({expenses.length} expenses)
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardHeader pb={2}>
                <Flex align="center" justify="space-between">
                  <CardTitle fontSize="sm" fontWeight="medium">
                    {taxSummary.netTaxOwing > 0 ? 'Net Tax Owing' : 'Refund Due'}
                  </CardTitle>
                  {taxSummary.netTaxOwing > 0 ? (
                    <AlertCircle size={16} color="red.500" />
                  ) : (
                    <CheckCircle size={16} color="green.500" />
                  )}
                </Flex>
              </CardHeader>
              <CardContent>
                <Text 
                  fontSize="2xl" 
                  fontWeight="bold" 
                  color={taxSummary.netTaxOwing > 0 ? 'red.600' : 'green.600'}
                >
                  ${isPrivacyMode ? maskValue(taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue) : (taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </Text>
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                  {taxSummary.netTaxOwing > 0 ? 'Due to CRA' : 'Expected refund'}
                </Text>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Tables */}
          <Tabs defaultValue="summary">
            <VStack spacing={4} align="stretch">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="sales">Sales Details</TabsTrigger>
                <TabsTrigger value="purchases">Purchase Details</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <VStack spacing={4}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Calculation Summary</CardTitle>
                      <CardDescription>
                        Detailed breakdown for {TAX_RATES[selectedProvince as keyof typeof TAX_RATES].name} 
                        - {selectedPeriod} period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead textAlign="right">Amount (CAD)</TableHead>
                          </TableRow>
                    </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell fontWeight="medium">Total Sales (before tax)</TableCell>
                            <TableCell textAlign="right">
                              ${isPrivacyMode ? maskValue(taxSummary.totalSales) : taxSummary.totalSales.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell fontWeight="medium">
                              {taxSummary.taxRates.hst > 0 ? `HST Collected (${taxSummary.taxRates.hst}%)` : `GST Collected (${taxSummary.taxRates.gst}%)`}
                            </TableCell>
                            <TableCell textAlign="right" color="green.600">
                              ${isPrivacyMode ? maskValue(taxSummary.gstCollected) : taxSummary.gstCollected.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell fontWeight="medium">Total Purchases (before tax)</TableCell>
                            <TableCell textAlign="right">
                              ${isPrivacyMode ? maskValue(taxSummary.totalPurchases) : taxSummary.totalPurchases.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell fontWeight="medium">GST/HST Paid on Purchases</TableCell>
                            <TableCell textAlign="right" color="blue.600">
                              ${isPrivacyMode ? maskValue(taxSummary.gstPaid) : taxSummary.gstPaid.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow borderTopWidth="2px" borderTopColor="gray.300">
                            <TableCell fontWeight="bold">
                              {taxSummary.netTaxOwing > 0 ? 'Net Tax Owing' : 'Refund Due'}
                            </TableCell>
                            <TableCell 
                              textAlign="right" 
                              fontWeight="bold"
                              color={taxSummary.netTaxOwing > 0 ? 'red.600' : 'green.600'}
                            >
                              ${isPrivacyMode ? maskValue(taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue) : (taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </VStack>
              </TabsContent>

              <TabsContent value="sales">
                <VStack spacing={4}>
              <Card>
                <CardHeader>
                  <CardTitle>Sales Details</CardTitle>
                  <CardDescription>All invoices for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <Center py={6}>
                      <VStack spacing={4}>
                        <PieChart size={48} color="gray.400" />
                        <Text color="gray.600" _dark={{ color: "gray.400" }}>
                          No sales recorded for this period
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead textAlign="right">Subtotal</TableHead>
                          <TableHead textAlign="right">Tax</TableHead>
                          <TableHead textAlign="right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell fontWeight="medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{isPrivacyMode ? maskValue(invoice.client_name) : invoice.client_name}</TableCell>
                            <TableCell>{new Date(invoice.issue_date).toLocaleDateString('en-CA')}</TableCell>
                            <TableCell textAlign="right">
                              ${isPrivacyMode ? maskValue(invoice.subtotal) : invoice.subtotal.toFixed(2)}
                            </TableCell>
                            <TableCell textAlign="right" color="green.600">
                              ${isPrivacyMode ? maskValue(invoice.tax_amount) : invoice.tax_amount.toFixed(2)}
                            </TableCell>
                            <TableCell textAlign="right" fontWeight="medium">
                              ${isPrivacyMode ? maskValue(invoice.total_amount) : invoice.total_amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
                </VStack>
              </TabsContent>

              <TabsContent value="purchases">
                <VStack spacing={4}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Purchase Details</CardTitle>
                      <CardDescription>All expenses for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {expenses.length === 0 ? (
                        <Center py={6}>
                          <VStack spacing={4}>
                            <BarChart3 size={48} color="gray.400" />
                            <Text color="gray.600" _dark={{ color: "gray.400" }}>
                              No expenses recorded for this period
                            </Text>
                          </VStack>
                        </Center>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead>Vendor</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead textAlign="right">Amount</TableHead>
                              <TableHead textAlign="right">Tax</TableHead>
                              <TableHead textAlign="right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {expenses.map((expense) => (
                              <TableRow key={expense.id}>
                                <TableCell fontWeight="medium">{expense.description}</TableCell>
                                <TableCell>{isPrivacyMode ? maskValue(expense.vendor || '') : expense.vendor || '-'}</TableCell>
                                <TableCell>{new Date(expense.expense_date).toLocaleDateString('en-CA')}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {expense.category?.name || 'Uncategorized'}
                                  </Badge>
                                </TableCell>
                                <TableCell textAlign="right">
                                  ${isPrivacyMode ? maskValue(expense.amount - expense.tax_amount) : (expense.amount - expense.tax_amount).toFixed(2)}
                                </TableCell>
                                <TableCell textAlign="right" color="blue.600">
                                  ${isPrivacyMode ? maskValue(expense.tax_amount) : expense.tax_amount.toFixed(2)}
                                </TableCell>
                                <TableCell textAlign="right" fontWeight="medium">
                                  ${isPrivacyMode ? maskValue(expense.amount) : expense.amount.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </VStack>
              </TabsContent>
            </VStack>
          </Tabs>
        </>
      )}
    </VStack>
  )
}