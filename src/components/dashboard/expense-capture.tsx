import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Check, Clock } from "lucide-react"

const recentExpenses = [
  {
    id: 1,
    description: "Coffee meeting with client",
    amount: "$24.50",
    category: "Meals & Entertainment",
    date: "2025-01-26",
    status: "processed",
    confidence: 0.95
  },
  {
    id: 2,
    description: "Uber to downtown office",
    amount: "$18.75",
    category: "Transportation",
    date: "2025-01-26",
    status: "processing",
    confidence: 0.88
  },
  {
    id: 3,
    description: "Office supplies - Staples",
    amount: "$67.90",
    category: "Office Expenses",
    date: "2025-01-25", 
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
            <CardTitle>Expense Capture</CardTitle>
            <CardDescription>
              AI-powered receipt scanning and categorization
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
            <span className="text-muted-foreground">This month processed</span>
            <span className="font-medium">127 receipts • $8,450.20</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}