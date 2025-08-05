import { Header } from "@/components/ui/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseList } from "@/components/expenses/expense-list"
import { SimpleExpenseManagement } from "@/components/expenses/simple-expense-management"
import { Settings, Zap } from "lucide-react"

const Expenses = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Enhanced Header Section */}
          <div className="bg-gradient-glass backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-glass border border-border/50 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg shadow-primary">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                    Expense Management
                  </h1>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Smart expense tracking with AI-powered categorization and real-time insights
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-primary">$2,847</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-success">12</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="enhanced" className="space-y-6">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-1 shadow-md border border-border/50">
              <TabsList className="grid w-full grid-cols-2 bg-transparent gap-1">
                <TabsTrigger 
                  value="enhanced" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary transition-all duration-200"
                >
                  <Zap className="h-4 w-4" />
                  Smart Management
                </TabsTrigger>
                <TabsTrigger 
                  value="standard" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  Standard View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="enhanced" className="animate-fade-in">
              <SimpleExpenseManagement />
            </TabsContent>

            <TabsContent value="standard" className="animate-fade-in">
              <ExpenseList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Expenses;