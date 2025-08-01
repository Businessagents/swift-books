import { Header } from "@/components/ui/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceList } from "@/components/invoices/invoice-list"
import { EnhancedInvoiceManagement } from "@/components/invoices/enhanced-invoice-management"
import { Settings, Zap } from "lucide-react"

const Invoices = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-6 px-4 md:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoice Management</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Professional invoice management with bulk operations and advanced tracking
            </p>
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