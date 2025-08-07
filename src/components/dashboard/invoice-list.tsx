import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MessageSquare } from "lucide-react"

const invoices = [
  {
    id: "2025-0847",
    customer: "Shopify Plus - Toronto HQ",
    amount: "$34,500.00",
    dueDate: "Feb 15, 2025",
    status: "pending",
    daysPast: 0,
    lastContact: "Jan 25, 2025"
  },
  {
    id: "2025-0832", 
    customer: "Royal Bank of Canada",
    amount: "$18,750.00",
    dueDate: "Jan 28, 2025",
    status: "overdue",
    daysPast: 7,
    lastContact: "Jan 20, 2025"
  },
  {
    id: "2025-0823",
    customer: "Vancouver City Planning",
    amount: "$12,300.00", 
    dueDate: "Feb 05, 2025",
    status: "pending",
    daysPast: 0,
    lastContact: null
  },
  {
    id: "2025-0819",
    customer: "Loblaws Corporate Services",
    amount: "$8,950.00",
    dueDate: "Jan 10, 2025", 
    status: "overdue",
    daysPast: 25,
    lastContact: "Jan 18, 2025"
  },
  {
    id: "2025-0815",
    customer: "Bell Canada Enterprise",
    amount: "$22,100.00",
    dueDate: "Feb 01, 2025", 
    status: "pending",
    daysPast: 0,
    lastContact: "Jan 24, 2025"
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
            <CardTitle>Account Receivables</CardTitle>
            <CardDescription>
              Outstanding invoices and payment status
            </CardDescription>
          </div>
          <Button>View All</Button>
        </div>
      </CardHeader>
      <CardBody>
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
      </CardBody>
    </Card>
  )
}