import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Filter, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const invoices = [
  {
    id: "INV-2024-001",
    client: "Shopify Plus",
    amount: 125000,
    status: "Paid",
    dueDate: "2024-01-15",
    issueDate: "2024-01-01",
    description: "Q4 Business Intelligence Implementation"
  },
  {
    id: "INV-2024-002", 
    client: "Royal Bank of Canada",
    amount: 89500,
    status: "Pending",
    dueDate: "2024-02-01",
    issueDate: "2024-01-15",
    description: "Financial Analytics Dashboard Development"
  },
  {
    id: "INV-2024-003",
    client: "Canadian Tire Corporation",
    amount: 67200,
    status: "Overdue",
    dueDate: "2024-01-20",
    issueDate: "2024-01-05",
    description: "E-commerce Analytics Integration"
  },
  {
    id: "INV-2024-004",
    client: "Loblaws Companies Limited",
    amount: 156000,
    status: "Draft",
    dueDate: "2024-02-15",
    issueDate: "2024-02-01",
    description: "Supply Chain Intelligence Platform"
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>
    case "Pending":
      return <Badge variant="secondary">Pending</Badge>
    case "Overdue":
      return <Badge variant="destructive">Overdue</Badge>
    case "Draft":
      return <Badge variant="outline">Draft</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const Invoices = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-6 px-4 md:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-muted-foreground">
                Manage client billing and payment tracking
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search invoices..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Overview of all client invoices and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{invoice.id}</p>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{invoice.client}</p>
                        <p className="text-sm">{invoice.description}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Issued: {invoice.issueDate}</span>
                          <span>Due: {invoice.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                      <p className="text-lg font-semibold">
                        ${invoice.amount.toLocaleString('en-CA')} CAD
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Invoices;