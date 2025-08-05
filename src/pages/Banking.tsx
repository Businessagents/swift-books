import { Header } from "@/components/ui/header"
import { BankIntegration } from "@/components/banking/bank-integration"
import { Banknote, TrendingUp, RotateCcw, Building2 } from "lucide-react"

const Banking = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden bg-gradient-hero rounded-2xl p-6 md:p-8 shadow-lg animate-fade-in">
            <div className="absolute inset-0 bg-gradient-glass backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-card/20 backdrop-blur-sm rounded-xl">
                    <Banknote className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
                    Banking & Reconciliation
                  </h1>
                </div>
                <p className="text-primary-foreground/90 max-w-2xl">
                  Connect your bank accounts for automatic transaction import, smart categorization, and seamless reconciliation
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <div className="bg-card/20 backdrop-blur-sm rounded-xl p-3 border border-primary-foreground/20">
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <Building2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Bank-Grade Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Integration Component */}
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <BankIntegration />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Banking