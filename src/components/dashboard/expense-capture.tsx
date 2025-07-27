import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Check, Clock } from "lucide-react"

const recentExpenses = [
  {
    id: 1,
    description: "Client lunch - The Keg Restaurant",
    amount: "$156.42",
    category: "Business Entertainment",
    date: "Jan 26, 2025",
    status: "processed",
    confidence: 0.97
  },
  {
    id: 2,
    description: "GO Transit - Union to Mississauga",
    amount: "$14.20",
    category: "Business Travel",
    date: "Jan 26, 2025",
    status: "processing",
    confidence: 0.94
  },
  {
    id: 3,
    description: "Microsoft Office 365 Business",
    amount: "$289.99",
    category: "Software & Subscriptions",
    date: "Jan 25, 2025", 
    status: "processed",
    confidence: 0.99
  },
  {
    id: 4,
    description: "Fuel - Petro-Canada Station",
    amount: "$87.35",
    category: "Vehicle & Fuel",
    date: "Jan 24, 2025", 
    status: "processed",
    confidence: 0.92
  }
]

export function ExpenseCapture() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Expense Management</CardTitle>
            <CardDescription>
              CRA-compliant receipt processing and tax categorization
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10">
              <Camera className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Scan</span>
              <span className="sm:hidden">Camera</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-start sm:items-center justify-between p-3 rounded-lg border bg-card-elevated">
              <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {expense.status === "processed" ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning" />
                  )}
                </div>
                
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{expense.description}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <Badge variant="outline" className="text-xs w-fit">
                      {expense.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(expense.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0 ml-2">
                <div className="font-semibold">{expense.amount}</div>
                <div className="text-xs text-muted-foreground">{expense.date}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">January 2025 Summary</span>
            <span className="font-medium">184 receipts • $12,847.50 CAD</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}