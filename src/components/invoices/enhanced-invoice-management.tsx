import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Send, 
  Download, 
  Eye, 
  DollarSign, 
  Calendar, 
  Users,
  MoreHorizontal,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  TrendingUp,
  Mail,
  Printer
} from "lucide-react"
import { usePrivacy } from "@/hooks/use-privacy"
import { InvoiceForm } from "./invoice-form"
import { PaymentReminderDialog } from "./payment-reminder-dialog"

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  client_email: string
  total_amount: number
  tax_amount: number
  subtotal: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue'
  issue_date: string
  due_date: string
  sent_at: string | null
  viewed_at: string | null
  paid_at: string | null
  currency: string
  notes?: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    line_total: number
  }>
}

const INVOICE_STATUSES = [
  { value: 'all', label: 'All Statuses', color: 'default' },
  { value: 'draft', label: 'Draft', color: 'secondary' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'viewed', label: 'Viewed', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' }
]

const BULK_ACTIONS = [
  { value: 'send', label: 'Send Selected', icon: Send },
  { value: 'download', label: 'Download PDFs', icon: Download },
  { value: 'reminder', label: 'Send Reminders', icon: Mail },
  { value: 'mark_paid', label: 'Mark as Paid', icon: CheckCircle },
  { value: 'duplicate', label: 'Duplicate Selected', icon: Copy },
  { value: 'delete', label: 'Delete Selected', icon: Trash2 }
]

export function EnhancedInvoiceManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ show: false, current: 0, total: 0, action: '' })
  
  const { maskValue, isPrivacyMode } = usePrivacy()
  const queryClient = useQueryClient()

  // Fetch invoices with enhanced filtering
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['enhanced-invoices', searchQuery, statusFilter, dateFilter, clientFilter],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`invoice_number.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%,client_email.ilike.%${searchQuery}%`)
      }

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter as any)
      }

      if (clientFilter !== "all") {
        query = query.eq('client_name', clientFilter)
      }

      if (dateFilter !== "all") {
        const now = new Date()
        let dateFrom = new Date()
        
        switch (dateFilter) {
          case "today":
            dateFrom.setHours(0, 0, 0, 0)
            break
          case "week":
            dateFrom.setDate(now.getDate() - 7)
            break
          case "month":
            dateFrom.setMonth(now.getMonth() - 1)
            break
          case "quarter":
            dateFrom.setMonth(now.getMonth() - 3)
            break
          case "year":
            dateFrom.setFullYear(now.getFullYear() - 1)
            break
        }
        
        if (dateFilter !== "all") {
          query = query.gte('issue_date', dateFrom.toISOString().split('T')[0])
        }
      }

      const { data, error } = await query

      if (error) {
        toast.error("Failed to fetch invoices")
        throw error
      }

      return data as Invoice[]
    }
  })

  // Get unique clients for filter
  const clients = Array.from(new Set(invoices.map(inv => inv.client_name))).filter(Boolean)

  // Bulk send invoices
  const bulkSendMutation = useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      setBulkProgress({ show: true, current: 0, total: invoiceIds.length, action: 'Sending invoices' })
      
      const results = []
      for (let i = 0; i < invoiceIds.length; i++) {
        const invoiceId = invoiceIds[i]
        setBulkProgress(prev => ({ ...prev, current: i + 1 }))
        
        try {
          const { data, error } = await supabase.functions.invoke('send-invoice', {
            body: { invoiceId }
          })
          if (error) throw error
          results.push({ success: true, invoiceId })
        } catch (error) {
          results.push({ success: false, invoiceId, error })
        }
      }
      
      setBulkProgress({ show: false, current: 0, total: 0, action: '' })
      return results
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-invoices'] })
      setSelectedInvoices(new Set())
      const successful = results.filter(r => r.success).length
      toast.success(`${successful} invoices sent successfully`)
      if (results.length > successful) {
        toast.error(`${results.length - successful} invoices failed to send`)
      }
    },
    onError: () => {
      setBulkProgress({ show: false, current: 0, total: 0, action: '' })
      toast.error("Failed to send invoices")
    }
  })

  // Bulk generate PDFs
  const bulkPDFMutation = useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      setBulkProgress({ show: true, current: 0, total: invoiceIds.length, action: 'Generating PDFs' })
      
      const results = []
      for (let i = 0; i < invoiceIds.length; i++) {
        const invoiceId = invoiceIds[i]
        setBulkProgress(prev => ({ ...prev, current: i + 1 }))
        
        try {
          const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
            body: { invoiceId }
          })
          if (error) throw error
          results.push({ success: true, invoiceId, data })
        } catch (error) {
          results.push({ success: false, invoiceId, error })
        }
      }
      
      setBulkProgress({ show: false, current: 0, total: 0, action: '' })
      return results
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success)
      
      // Create a zip file with all PDFs (simplified - in real app would use JSZip)
      successful.forEach((result, index) => {
        const link = document.createElement('a')
        link.href = result.data.pdfUrl
        link.download = `invoice-${result.data.invoiceNumber}.pdf`
        if (index === 0) link.click() // For demo, just download the first one
      })
      
      setSelectedInvoices(new Set())
      toast.success(`${successful.length} PDFs generated`)
    },
    onError: () => {
      setBulkProgress({ show: false, current: 0, total: 0, action: '' })
      toast.error("Failed to generate PDFs")
    }
  })

  // Bulk mark as paid
  const bulkMarkPaidMutation = useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .in('id', invoiceIds)

      if (error) throw error
    },
    onSuccess: (_, invoiceIds) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-invoices'] })
      setSelectedInvoices(new Set())
      toast.success(`${invoiceIds.length} invoices marked as paid`)
    },
    onError: () => {
      toast.error("Failed to update invoice status")
    }
  })

  // Bulk duplicate invoices
  const bulkDuplicateMutation = useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      const invoicesToDuplicate = invoices.filter(inv => invoiceIds.includes(inv.id))
      
      for (const invoice of invoicesToDuplicate) {
        // Create new invoice with incremented number
        const newInvoiceNumber = `${invoice.invoice_number.split('-')[0]}-${Date.now()}`
        
        const { data: newInvoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: newInvoiceNumber,
            client_name: invoice.client_name,
            client_email: invoice.client_email,
            total_amount: invoice.total_amount,
            tax_amount: invoice.tax_amount,
            subtotal: invoice.subtotal,
            status: 'draft',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            currency: invoice.currency,
            notes: invoice.notes
          })
          .select()
          .single()

        if (invoiceError) throw invoiceError

        // Duplicate items
        if (invoice.items && invoice.items.length > 0) {
          const itemsToInsert = invoice.items.map(item => ({
            invoice_id: newInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total
          }))

          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsToInsert)

          if (itemsError) throw itemsError
        }
      }
    },
    onSuccess: (_, invoiceIds) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-invoices'] })
      setSelectedInvoices(new Set())
      toast.success(`${invoiceIds.length} invoices duplicated`)
    },
    onError: () => {
      toast.error("Failed to duplicate invoices")
    }
  })

  // Bulk delete invoices
  const bulkDeleteMutation = useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .in('id', invoiceIds)

      if (error) throw error
    },
    onSuccess: (_, invoiceIds) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-invoices'] })
      setSelectedInvoices(new Set())
      toast.success(`${invoiceIds.length} invoices deleted successfully`)
    },
    onError: () => {
      toast.error("Failed to delete invoices")
    }
  })

  // Calculate summary stats
  const summaryStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total_amount, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0),
    outstandingAmount: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total_amount, 0)
  }

  const handleSelectAll = () => {
    if (selectedInvoices.size === invoices.length) {
      setSelectedInvoices(new Set())
    } else {
      setSelectedInvoices(new Set(invoices.map(i => i.id)))
    }
  }

  const handleSelectInvoice = (invoiceId: string) => {
    const newSelection = new Set(selectedInvoices)
    if (newSelection.has(invoiceId)) {
      newSelection.delete(invoiceId)
    } else {
      newSelection.add(invoiceId)
    }
    setSelectedInvoices(newSelection)
  }

  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedInvoices)
    if (selectedIds.length === 0) {
      toast.error("Please select invoices first")
      return
    }

    switch (action) {
      case 'send':
        if (confirm(`Send ${selectedIds.length} invoices to clients?`)) {
          bulkSendMutation.mutate(selectedIds)
        }
        break
      case 'download':
        bulkPDFMutation.mutate(selectedIds)
        break
      case 'reminder':
        // For demo, just show dialog for first selected invoice
        const firstInvoice = invoices.find(inv => selectedIds.includes(inv.id))
        if (firstInvoice) {
          setSelectedInvoice(firstInvoice)
          setIsReminderDialogOpen(true)
        }
        break
      case 'mark_paid':
        if (confirm(`Mark ${selectedIds.length} invoices as paid?`)) {
          bulkMarkPaidMutation.mutate(selectedIds)
        }
        break
      case 'duplicate':
        if (confirm(`Create copies of ${selectedIds.length} invoices?`)) {
          bulkDuplicateMutation.mutate(selectedIds)
        }
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedIds.length} invoices? This cannot be undone.`)) {
          bulkDeleteMutation.mutate(selectedIds)
        }
        break
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = INVOICE_STATUSES.find(s => s.value === status)
    const colorClass = {
      'green': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'blue': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'yellow': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'red': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'secondary': 'bg-secondary text-secondary-foreground',
      'default': 'bg-primary text-primary-foreground'
    }[statusConfig?.color || 'default']

    return <Badge className={colorClass}>{statusConfig?.label || status}</Badge>
  }

  const isAllSelected = invoices.length > 0 && selectedInvoices.size === invoices.length
  const isSomeSelected = selectedInvoices.size > 0 && selectedInvoices.size < invoices.length

  return (
    <div className="space-y-6">
      {/* Bulk Progress Indicator */}
      {bulkProgress.show && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>{bulkProgress.action}...</span>
                <span className="text-sm">{bulkProgress.current}/{bulkProgress.total}</span>
              </div>
              <Progress value={(bulkProgress.current / bulkProgress.total) * 100} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isPrivacyMode ? maskValue(summaryStats.totalAmount) : summaryStats.totalAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.total} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${isPrivacyMode ? maskValue(summaryStats.paidAmount) : summaryStats.paidAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.paid} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${isPrivacyMode ? maskValue(summaryStats.outstandingAmount) : summaryStats.outstandingAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.total - summaryStats.paid} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summaryStats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Invoice Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Enhanced Invoice Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Professional invoice management with bulk operations and advanced tracking
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                  </DialogHeader>
                  <InvoiceForm
                    onSuccess={() => {
                      setIsCreateDialogOpen(false)
                      queryClient.invalidateQueries({ queryKey: ['enhanced-invoices'] })
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Advanced Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices, clients, email addresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedInvoices.size > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>{selectedInvoices.size} invoices selected</span>
                    <div className="flex gap-2 flex-wrap">
                      {BULK_ACTIONS.map(action => {
                        const Icon = action.icon
                        const isDisabled = bulkSendMutation.isPending || 
                                         bulkPDFMutation.isPending || 
                                         bulkMarkPaidMutation.isPending || 
                                         bulkDuplicateMutation.isPending || 
                                         bulkDeleteMutation.isPending
                        
                        return (
                          <Button
                            key={action.value}
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction(action.value)}
                            disabled={isDisabled}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {action.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || clientFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by creating your first invoice."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Header */}
              <div className="flex items-center gap-3 py-2 border-b">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <span className="text-sm text-muted-foreground">
                  {isAllSelected ? "Deselect all" : isSomeSelected ? `${selectedInvoices.size} selected` : "Select all"}
                </span>
              </div>

              {/* Invoice List */}
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                    selectedInvoices.has(invoice.id) ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/30'
                  }`}
                >
                  <Checkbox
                    checked={selectedInvoices.has(invoice.id)}
                    onCheckedChange={() => handleSelectInvoice(invoice.id)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{invoice.invoice_number}</p>
                      {getStatusBadge(invoice.status)}
                      {invoice.status === 'overdue' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setIsReminderDialogOpen(true)
                          }}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {isPrivacyMode ? maskValue(invoice.client_name) : invoice.client_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(invoice.due_date).toLocaleDateString('en-CA')}
                      </span>
                      <span>{invoice.items.length} items</span>
                      {invoice.sent_at && (
                        <span>Sent: {new Date(invoice.sent_at).toLocaleDateString('en-CA')}</span>
                      )}
                      {invoice.viewed_at && (
                        <span className="text-blue-600">
                          <Eye className="h-3 w-3 inline mr-1" />
                          Viewed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${isPrivacyMode ? maskValue(invoice.total_amount) : invoice.total_amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{invoice.currency}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedInvoice(invoice)
                          setIsEditDialogOpen(true)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => bulkPDFMutation.mutate([invoice.id])}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => bulkSendMutation.mutate([invoice.id])}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Invoice
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => bulkDuplicateMutation.mutate([invoice.id])}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => {
                            if (confirm("Mark this invoice as paid?")) {
                              bulkMarkPaidMutation.mutate([invoice.id])
                            }
                          }}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this invoice?")) {
                              bulkDeleteMutation.mutate([invoice.id])
                            }
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceForm
              invoice={selectedInvoice}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setSelectedInvoice(null)
                queryClient.invalidateQueries({ queryKey: ['enhanced-invoices'] })
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Reminder Dialog */}
      {selectedInvoice && (
        <PaymentReminderDialog
          open={isReminderDialogOpen}
          onOpenChange={setIsReminderDialogOpen}
          invoice={selectedInvoice}
          onSuccess={() => {
            setIsReminderDialogOpen(false)
            setSelectedInvoice(null)
            queryClient.invalidateQueries({ queryKey: ['enhanced-invoices'] })
          }}
        />
      )}
    </div>
  )
}