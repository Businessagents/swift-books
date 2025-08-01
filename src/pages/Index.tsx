import { Header } from "@/components/ui/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { InvoiceList } from "@/components/dashboard/invoice-list"
import { ExpenseCapture } from "@/components/dashboard/expense-capture"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CashflowTracker } from "@/components/dashboard/cashflow-tracker"
import { AiChat } from "@/components/ai/ai-chat"
import { ReceiptUpload } from "@/components/receipt-upload"
import { ExpenseCategorizer } from "@/components/ai/expense-categorizer"
import { Badge } from "@/components/ui/badge"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-6 px-4 md:px-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Swift Books
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              AI-powered accounting for Canadian freelancers. Capture expenses instantly, generate compliant reports, and cut bookkeeping time by 80%.
            </p>
          </div>

          {/* Primary Actions - Expense Capture Hero */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-semibold">Capture Expenses</h2>
              <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <ReceiptUpload />
              <ExpenseCategorizer />
            </div>
          </section>

          {/* Business Overview */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-semibold">Business Overview</h2>
            </div>
            <StatsCards />
          </section>

          {/* Quick Operations */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-semibold">Operations Center</h2>
            </div>
            <QuickActions />
          </section>

          {/* Detailed Analytics & Management */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-semibold">Analytics & Management</h2>
            </div>
            
            <div className="grid gap-6 xl:grid-cols-4">
              <div className="xl:col-span-3 space-y-6">
                <CashflowTracker />
                <InvoiceList />
              </div>
              
              <div className="space-y-6">
                <ExpenseCapture />
                <AiChat />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
