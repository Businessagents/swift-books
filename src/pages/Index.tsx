import { Header } from "@/components/ui/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { InvoiceList } from "@/components/dashboard/invoice-list"
import { ExpenseCapture } from "@/components/dashboard/expense-capture"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CashflowTracker } from "@/components/dashboard/cashflow-tracker"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-6 px-4 md:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Business Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Real-time financial metrics and operational insights for your business
            </p>
          </div>

          {/* Business Operations - Hero Section */}
          <QuickActions />

          {/* Stats Overview */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <CashflowTracker />
              <InvoiceList />
            </div>
            
            <div className="space-y-4 md:space-y-6">
              <ExpenseCapture />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
