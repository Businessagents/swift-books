import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Search, Plus, Edit, Trash2, FileText, Send, Download, Eye, DollarSign, Calendar, Users } from "lucide-react"
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
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    line_total: number
  }>
}

export function InvoiceList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  
  const { maskValue, isPrivacyMode } = usePrivacy()
  const queryClient = useQueryClient()

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`invoice_number.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`)
      }

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter as any)
      }

      const { data, error } = await query

      if (error) {
        toast.error("Failed to fetch invoices")
        throw error
      }

      return data as Invoice[]
    }
  })

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success("Invoice deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete invoice")
    }
  })

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { invoiceId }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success("Invoice sent successfully")
    },
    onError: (error) => {
      console.error('Send invoice error:', error)
      toast.error("Failed to send invoice")
    }
  })

  // Generate PDF mutation
  const generatePDFMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoiceId }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Create download link
      const link = document.createElement('a')
      link.href = data.pdfUrl
      link.download = `invoice-${data.invoiceNumber}.pdf`
      link.click()
      toast.success("PDF generated successfully")
    },
    onError: () => {
      toast.error("Failed to generate PDF")
    }
  })

  const handleDelete = (invoiceId: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(invoiceId)
    }
  }

  const handleSend = (invoiceId: string) => {
    sendInvoiceMutation.mutate(invoiceId)
  }

  const handleGeneratePDF = (invoiceId: string) => {
    generatePDFMutation.mutate(invoiceId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>
      case 'viewed':
        return <Badge variant="outline">Viewed</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0)
  const pendingAmount = totalAmount - paidAmount

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isPrivacyMode ? maskValue(totalAmount) : totalAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${isPrivacyMode ? maskValue(paidAmount) : paidAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === 'paid').length} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${isPrivacyMode ? maskValue(pendingAmount) : pendingAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status !== 'paid').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(invoices.map(inv => inv.client_name)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Invoice Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Invoice Management</CardTitle>
              <p className="text-sm text-muted-foreground">Create, send, and track client invoices</p>
            </div>
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
                    queryClient.invalidateQueries({ queryKey: ['invoices'] })
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
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
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
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
                      <span>{isPrivacyMode ? maskValue(invoice.client_name) : invoice.client_name}</span>
                      <span>Due: {new Date(invoice.due_date).toLocaleDateString('en-CA')}</span>
                      <span>{invoice.items.length} items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${isPrivacyMode ? maskValue(invoice.total_amount) : invoice.total_amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{invoice.currency}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleGeneratePDF(invoice.id)}
                        disabled={generatePDFMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSend(invoice.id)}
                          disabled={sendInvoiceMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Dialog open={isEditDialogOpen && selectedInvoice?.id === invoice.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
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
                                queryClient.invalidateQueries({ queryKey: ['invoices'] })
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteInvoiceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Reminder Dialog */}
      {selectedInvoice && (
        <PaymentReminderDialog
          open={isReminderDialogOpen}
          onOpenChange={setIsReminderDialogOpen}
          invoice={selectedInvoice}
          onSuccess={() => {
            setIsReminderDialogOpen(false)
            setSelectedInvoice(null)
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
          }}
        />
      )}
    </div>
  )
}