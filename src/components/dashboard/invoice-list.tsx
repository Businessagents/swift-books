import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MessageSquare } from "lucide-react"

const invoices = [
  {
    id: "INV-001",
    customer: "Maple Digital Agency",
    amount: "$4,580",
    dueDate: "2025-01-15",
    status: "overdue",
    daysPast: 15,
    lastContact: "2025-01-20"
  },
  {
    id: "INV-002", 
    customer: "Northern Construction Ltd",
    amount: "$12,350",
    dueDate: "2025-01-28",
    status: "pending",
    daysPast: 0,
    lastContact: "2025-01-25"
  },
  {
    id: "INV-003",
    customer: "Tech Startup Inc",
    amount: "$2,890", 
    dueDate: "2025-02-05",
    status: "pending",
    daysPast: 0,
    lastContact: null
  },
  {
    id: "INV-004",
    customer: "Local Restaurant Group",
    amount: "$1,250",
    dueDate: "2025-01-10", 
    status: "overdue",
    daysPast: 25,
    lastContact: "2025-01-18"
  }
]

function getStatusBadge(status: string, daysPast: number) {
  if (status === "overdue") {
    return <Badge variant="destructive">Overdue {daysPast}d</Badge>
  }
  return <Badge variant="secondary">Pending</Badge>
}

export function InvoiceList() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Invoices requiring follow-up or attention
            </CardDescription>
          </div>
          <Button>View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border bg-card-elevated">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{invoice.customer}</span>
                  {getStatusBadge(invoice.status, invoice.daysPast)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice.id} • Due {invoice.dueDate}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold text-lg">{invoice.amount}</div>
                  {invoice.lastContact && (
                    <div className="text-xs text-muted-foreground">
                      Last contact: {invoice.lastContact}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-1">
                  <Button size="icon" variant="ghost">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}