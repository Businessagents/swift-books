import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Send, BarChart3, Download, Plus, Zap } from "lucide-react"

const actions = [
  {
    title: "Send Reminders",
    description: "Send AI-crafted follow-ups to 8 overdue invoices",
    icon: Send,
    variant: "gradient" as const,
    count: 8
  },
  {
    title: "Generate Report", 
    description: "Create monthly P&L and cashflow report",
    icon: BarChart3,
    variant: "default" as const
  },
  {
    title: "New Invoice",
    description: "Create and send a new invoice",
    icon: FileText,
    variant: "secondary" as const
  },
  {
    title: "Export Data",
    description: "Download CRA-ready expense export",
    icon: Download, 
    variant: "outline" as const
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              One-click workflows to boost your cash flow
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon
            
            return (
              <Button
                key={action.title}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-start space-y-2"
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className="h-5 w-5" />
                  {action.count && (
                    <Badge variant="secondary" className="ml-2">
                      {action.count}
                    </Badge>
                  )}
                </div>
                <div className="text-left space-y-1">
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}