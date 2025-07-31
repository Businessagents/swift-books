import { Header } from "@/components/ui/header"
import { CategoryExpenseTracker } from "@/components/dashboard/category-expense-tracker"

const Expenses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-6 px-4 md:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Expense Management</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Track, categorize, and analyze business expenses
            </p>
          </div>

          {/* Main Content */}
          <CategoryExpenseTracker />
        </div>
      </main>
    </div>
  );
};

export default Expenses;