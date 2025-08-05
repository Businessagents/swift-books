import { Header } from "@/components/ui/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { InvoiceList } from "@/components/dashboard/invoice-list"
import { ExpenseCapture } from "@/components/dashboard/expense-capture"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CashflowTracker } from "@/components/dashboard/cashflow-tracker"
import { AiChat } from "@/components/ai/ai-chat"
import { ReceiptUpload } from "@/components/receipt-upload"
import { ExpenseCategorizer } from "@/components/ai/expense-categorizer"
import { FinancialHealthScore } from "@/components/dashboard/financial-health-score"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Receipt, DollarSign, Zap } from "lucide-react"

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8 md:py-12 px-4 md:px-8">
        <div className="space-y-12">
          {/* Enhanced Hero Section */}
          <div className="relative overflow-hidden bg-gradient-hero rounded-3xl p-8 md:p-12 shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-glass backdrop-blur-sm"></div>
            <div className="relative space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-card/20 backdrop-blur-sm rounded-2xl">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary-foreground">
                    Swift Books
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-card/20 backdrop-blur-sm text-primary-foreground border-primary-foreground/20">AI-Powered</Badge>
                    <Badge variant="secondary" className="bg-card/20 backdrop-blur-sm text-primary-foreground border-primary-foreground/20">Canadian Compliant</Badge>
                  </div>
                </div>
              </div>
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl leading-relaxed">
                Transform your freelance accounting with AI. Capture expenses instantly, generate compliant reports, and cut bookkeeping time by 80% while staying CRA compliant.
              </p>
              
              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-foreground">80%</div>
                  <div className="text-sm text-primary-foreground/80">Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-foreground">$2.8k</div>
                  <div className="text-sm text-primary-foreground/80">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-foreground">47</div>
                  <div className="text-sm text-primary-foreground/80">Active Clients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Expense Capture Section */}
          <section className="space-y-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-gradient-success rounded-xl shadow-success">
                <Receipt className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Capture Expenses</h2>
                <p className="text-muted-foreground">AI-powered receipt processing with instant categorization</p>
              </div>
              <div className="ml-auto hidden md:block">
                <Badge variant="outline" className="bg-gradient-glass backdrop-blur-sm border-success/20 text-success">
                  99% Accuracy
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <ReceiptUpload />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <ExpenseCategorizer />
              </div>
            </div>
          </section>

          {/* Enhanced Business Overview */}
          <section className="space-y-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-primary rounded-xl shadow-primary">
                  <DollarSign className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary">Business Overview</h2>
                  <p className="text-muted-foreground">Real-time financial insights and performance metrics</p>
                </div>
              </div>
              <Button variant="outline" className="hidden md:flex bg-gradient-glass backdrop-blur-sm border-border/50">
                View Details
              </Button>
            </div>
            <StatsCards />
          </section>

          {/* Enhanced Operations Center */}
          <section className="space-y-8 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-warning rounded-xl shadow-warning">
                <Zap className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Operations Center</h2>
                <p className="text-muted-foreground">Quick actions for common business workflows</p>
              </div>
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
              <div className="xl:col-span-2 space-y-6">
                <CashflowTracker />
                <InvoiceList />
              </div>
              
              <div className="xl:col-span-1 space-y-6">
                <FinancialHealthScore />
                <ExpenseCapture />
              </div>
              
              <div className="xl:col-span-1 space-y-6">
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
