import { Header } from "@/components/ui/header"
import { FloatingAiChat } from "@/components/ai/floating-ai-chat"
import { WidgetSystem } from "@/components/dashboard/widget-system"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard } from "lucide-react"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-8 md:py-12 px-4 md:px-8">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="bg-primary rounded-3xl p-8 md:p-12 shadow-lg animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                    Dashboard
                  </h1>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      AI-Powered
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      Real-time
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed">
                Your personalized business overview with customizable widgets, real-time insights, and quick actions.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">$287K</div>
                  <div className="text-sm text-white/80">Revenue YTD</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">+18%</div>
                  <div className="text-sm text-white/80">Growth Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">47</div>
                  <div className="text-sm text-white/80">Active Clients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Dashboard */}
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <WidgetSystem />
          </div>
        </div>
      </main>
      
      {/* Floating AI Assistant */}
      <FloatingAiChat />
    </div>
  );
};

export default Index;