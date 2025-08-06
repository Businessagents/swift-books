import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SimpleExpenseManagement } from "@/components/expenses/simple-expense-management"
import { InvoiceList } from "@/components/invoices/invoice-list"
import { ReceiptUploadEnhanced } from "@/components/receipt-upload-enhanced"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CreditCard, 
  FileText, 
  Receipt as ReceiptIcon, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Clock
} from "lucide-react"

const Transactions = () => {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false)

  // Mock stats - in real implementation, these would come from hooks/API
  const transactionStats = {
    totalIncome: 24750,
    totalExpenses: 8432,
    pendingInvoices: 6,
    processedReceipts: 23,
    monthlyChange: 12.5
  }

  const quickActions = [
    {
      title: "New Expense",
      description: "Add a manual expense entry",
      icon: CreditCard,
      action: () => {
        // This would typically open an expense form or navigate to expense creation
        console.log("Open new expense form")
      },
      color: "bg-red-50 text-red-600 hover:bg-red-100"
    },
    {
      title: "Create Invoice",
      description: "Generate a new client invoice",
      icon: FileText,
      action: () => {
        // This would typically open an invoice form or navigate to invoice creation
        console.log("Open new invoice form")
      },
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100"
    },
    {
      title: "Upload Receipt",
      description: "Process receipt with AI",
      icon: ReceiptIcon,
      action: () => setShowReceiptUpload(true),
      color: "bg-green-50 text-green-600 hover:bg-green-100"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-card rounded-xl p-6 md:p-8 border shadow-sm animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <CreditCard className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Transactions
                  </h1>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Unified view of all your business transactions - expenses, invoices, and receipts in one place
                </p>
              </div>
              
              {/* Quick Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center p-4 bg-muted rounded-lg border">
                  <div className="flex items-center justify-center gap-1 text-success mb-1">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-lg font-bold">${transactionStats.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Income</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg border">
                  <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                    <ArrowDownLeft className="h-4 w-4" />
                    <span className="text-lg font-bold">${transactionStats.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Expenses</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg border lg:block hidden">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-lg font-bold">+{transactionStats.monthlyChange}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Growth</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card key={action.title} className="hover:shadow-md transition-all duration-300 cursor-pointer group" onClick={action.action}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${action.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="expenses" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="expenses" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Expenses</span>
                </TabsTrigger>
                <TabsTrigger value="invoices" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Invoices</span>
                </TabsTrigger>
                <TabsTrigger value="receipts" className="flex items-center gap-2">
                  <ReceiptIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Receipts</span>
                </TabsTrigger>
              </TabsList>

              {/* Status Overview for Current Tab */}
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {transactionStats.pendingInvoices} Pending
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {transactionStats.processedReceipts} Processed
                </Badge>
              </div>
            </div>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Expense Management
                  </CardTitle>
                  <CardDescription>
                    Track and categorize your business expenses with AI-powered insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <SimpleExpenseManagement />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Invoice Management
                      </CardTitle>
                      <CardDescription>
                        Create, send, and track client invoices with automated reminders
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Invoice
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <InvoiceList />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Receipts Tab */}
            <TabsContent value="receipts" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ReceiptIcon className="h-5 w-5" />
                        Receipt Processing
                      </CardTitle>
                      <CardDescription>
                        AI-powered receipt scanning and automatic expense categorization
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowReceiptUpload(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Receipt
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <ReceiptIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Receipt Processing Hub</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload receipts to automatically extract data and create expense entries
                    </p>
                    <Button onClick={() => setShowReceiptUpload(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload First Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Receipt Upload Dialog */}
      <Dialog open={showReceiptUpload} onOpenChange={setShowReceiptUpload}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>
              Upload a receipt image for automatic processing and categorization.
            </DialogDescription>
          </DialogHeader>
          <ReceiptUploadEnhanced 
            onReceiptProcessed={() => setShowReceiptUpload(false)}
            onExpenseCreated={() => setShowReceiptUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Transactions