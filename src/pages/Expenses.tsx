import { Header } from "@/components/ui/header"
import { SimpleExpenseManagement } from "@/components/expenses/simple-expense-management"
import { Zap } from "lucide-react"

const Expenses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Clean Header Section */}
          <div className="bg-card rounded-xl p-6 md:p-8 border shadow-sm animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Expense Management
                  </h1>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Smart expense tracking with AI-powered categorization and real-time insights
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="text-center p-4 bg-muted rounded-lg border">
                  <div className="text-2xl font-bold text-primary">$2,847</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg border">
                  <div className="text-2xl font-bold text-success">12</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Expense Management */}
          <SimpleExpenseManagement />
        </div>
      </main>
    </div>
  );
};

export default Expenses;