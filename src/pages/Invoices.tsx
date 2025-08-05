import { Header } from "@/components/ui/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceList } from "@/components/invoices/invoice-list"
import { EnhancedInvoiceManagement } from "@/components/invoices/enhanced-invoice-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Zap, FileText, TrendingUp, DollarSign, Clock } from "lucide-react"

const Invoices = () => {
  const quickStats = [
    { title: "Total Outstanding", value: "$24,750", change: "+12%", icon: DollarSign, color: "text-blue-600" },
    { title: "Sent This Month", value: "18", change: "+5", icon: FileText, color: "text-green-600" },
    { title: "Avg. Payment Time", value: "12 days", change: "-2 days", icon: Clock, color: "text-orange-600" },
    { title: "Collection Rate", value: "94%", change: "+3%", icon: TrendingUp, color: "text-purple-600" }
  ]

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
                    <FileText className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
                    Invoice Management
                  </h1>
                </div>
                <p className="text-primary-foreground/90 max-w-2xl">
                  Professional invoice management with AI-powered insights, bulk operations, and real-time payment tracking
                </p>
              </div>
              <Button variant="secondary" className="hidden md:flex bg-card/20 backdrop-blur-sm border-primary-foreground/20">
                <FileText className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            {quickStats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="bg-gradient-card border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="enhanced" className="space-y-4">
            <TabsList>
              <TabsTrigger value="enhanced" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Enhanced Management
              </TabsTrigger>
              <TabsTrigger value="standard" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Standard View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enhanced">
              <EnhancedInvoiceManagement />
            </TabsContent>

            <TabsContent value="standard">
              <InvoiceList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Invoices;