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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expense Capture</CardTitle>
            <CardDescription>
              AI-powered receipt scanning and categorization
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border bg-card-elevated">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  {expense.status === "processed" ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium text-sm">{expense.description}</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(expense.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
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