import { Header } from "@/components/ui/header"
import { FloatingAiChat } from "@/components/ai/floating-ai-chat"
import { ReceiptUpload } from "@/components/receipt-upload"
import { Badge } from "@/components/ui/badge"
import { Brain, Receipt } from "lucide-react"

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
            
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <ReceiptUpload />
            </div>
          </section>

        </div>
      </main>
      
      {/* Floating AI Assistant */}
      <FloatingAiChat />
    </div>
  );
};

export default Index;
