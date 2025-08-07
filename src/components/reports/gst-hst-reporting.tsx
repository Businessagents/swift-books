import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/integrations/supabase/client"
import { usePrivacy } from "@/hooks/use-privacy"
import { toast } from "@/components/ui/sonner"
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

      toast.success('GST/HST report exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = expensesLoading || invoicesLoading

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GST/HST Reporting</h2>
          <p className="text-muted-foreground">CRA-compliant tax reporting for Canadian businesses</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-[200px]">
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
            <SelectTrigger className="w-[150px]">
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
            <SelectTrigger className="w-[120px]">
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
              <SelectTrigger className="w-[120px]">
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
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filing Deadline Alert */}
      {filingDeadline && (
        <Alert className={filingDeadline.isOverdue ? "border-red-500" : filingDeadline.isUrgent ? "border-yellow-500" : "border-green-500"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {filingDeadline.isOverdue 
                  ? `Filing deadline was ${Math.abs(filingDeadline.daysUntil)} days ago`
                  : `Filing deadline: ${filingDeadline.date.toLocaleDateString('en-CA')} (${filingDeadline.daysUntil} days)`
                }
              </span>
              {filingDeadline.isOverdue ? (
                <Badge variant="destructive">Overdue</Badge>
              ) : filingDeadline.isUrgent ? (
                <Badge variant="secondary">Urgent</Badge>
              ) : (
                <Badge variant="default">On Track</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardBody pt={6}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading tax data...</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          </CardBody>
        </Card>
      )}

      {!isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" pb={2}>
                <CardTitle fontSize="sm" fontWeight="medium">Total Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">
                  ${isPrivacyMode ? maskValue(taxSummary.totalSales) : taxSummary.totalSales.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Before tax ({invoices.length} invoices)
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" pb={2}>
                <CardTitle fontSize="sm" fontWeight="medium">Tax Collected</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold text-green-600">
                  ${isPrivacyMode ? maskValue(taxSummary.gstCollected) : taxSummary.gstCollected.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {taxSummary.taxRates.hst > 0 ? `HST ${taxSummary.taxRates.hst}%` : `GST ${taxSummary.taxRates.gst}%`}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" pb={2}>
                <CardTitle fontSize="sm" fontWeight="medium">Tax Paid</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold text-blue-600">
                  ${isPrivacyMode ? maskValue(taxSummary.gstPaid) : taxSummary.gstPaid.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  On purchases ({expenses.length} expenses)
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" pb={2}>
                <CardTitle fontSize="sm" fontWeight="medium">
                  {taxSummary.netTaxOwing > 0 ? 'Net Tax Owing' : 'Refund Due'}
                </CardTitle>
                {taxSummary.netTaxOwing > 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </CardHeader>
              <CardBody>
                <div className={`text-2xl font-bold ${taxSummary.netTaxOwing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${isPrivacyMode ? maskValue(taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue) : (taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {taxSummary.netTaxOwing > 0 ? 'Due to CRA' : 'Expected refund'}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Detailed Tables */}
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="sales">Sales Details</TabsTrigger>
              <TabsTrigger value="purchases">Purchase Details</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Calculation Summary</CardTitle>
                  <CardDescription>
                    Detailed breakdown for {TAX_RATES[selectedProvince as keyof typeof TAX_RATES].name} 
                    - {selectedPeriod} period
                  </CardDescription>
                </CardHeader>
                <CardBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount (CAD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Total Sales (before tax)</TableCell>
                        <TableCell className="text-right">
                          ${isPrivacyMode ? maskValue(taxSummary.totalSales) : taxSummary.totalSales.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          {taxSummary.taxRates.hst > 0 ? `HST Collected (${taxSummary.taxRates.hst}%)` : `GST Collected (${taxSummary.taxRates.gst}%)`}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          ${isPrivacyMode ? maskValue(taxSummary.gstCollected) : taxSummary.gstCollected.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Purchases (before tax)</TableCell>
                        <TableCell className="text-right">
                          ${isPrivacyMode ? maskValue(taxSummary.totalPurchases) : taxSummary.totalPurchases.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">GST/HST Paid on Purchases</TableCell>
                        <TableCell className="text-right text-blue-600">
                          ${isPrivacyMode ? maskValue(taxSummary.gstPaid) : taxSummary.gstPaid.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-t-2">
                        <TableCell className="font-bold">
                          {taxSummary.netTaxOwing > 0 ? 'Net Tax Owing' : 'Refund Due'}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${taxSummary.netTaxOwing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${isPrivacyMode ? maskValue(taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue) : (taxSummary.netTaxOwing > 0 ? taxSummary.netTaxOwing : taxSummary.refundDue).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Details</CardTitle>
                  <CardDescription>All invoices for the selected period</CardDescription>
                </CardHeader>
                <CardBody>
                  {invoices.length === 0 ? (
                    <div className="text-center py-6">
                      <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No sales recorded for this period</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{isPrivacyMode ? maskValue(invoice.client_name) : invoice.client_name}</TableCell>
                            <TableCell>{new Date(invoice.issue_date).toLocaleDateString('en-CA')}</TableCell>
                            <TableCell className="text-right">
                              ${isPrivacyMode ? maskValue(invoice.subtotal) : invoice.subtotal.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              ${isPrivacyMode ? maskValue(invoice.tax_amount) : invoice.tax_amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${isPrivacyMode ? maskValue(invoice.total_amount) : invoice.total_amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Details</CardTitle>
                  <CardDescription>All expenses for the selected period</CardDescription>
                </CardHeader>
                <CardBody>
                  {expenses.length === 0 ? (
                    <div className="text-center py-6">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No expenses recorded for this period</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell>{isPrivacyMode ? maskValue(expense.vendor || '') : expense.vendor || '-'}</TableCell>
                            <TableCell>{new Date(expense.expense_date).toLocaleDateString('en-CA')}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {expense.category?.name || 'Uncategorized'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              ${isPrivacyMode ? maskValue(expense.amount - expense.tax_amount) : (expense.amount - expense.tax_amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-blue-600">
                              ${isPrivacyMode ? maskValue(expense.tax_amount) : expense.tax_amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${isPrivacyMode ? maskValue(expense.amount) : expense.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}