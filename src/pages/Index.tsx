import { Header } from "@/components/ui/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { InvoiceList } from "@/components/dashboard/invoice-list"
import { ExpenseCapture } from "@/components/dashboard/expense-capture"
import { QuickActions } from "@/components/dashboard/quick-actions"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your business financial overview.
            </p>
          </div>

          {/* Stats Overview */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <InvoiceList />
            </div>
            
            <div className="space-y-6">
              <QuickActions />
              <ExpenseCapture />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
