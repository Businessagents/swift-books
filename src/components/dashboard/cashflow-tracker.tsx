import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { usePrivacy } from "@/hooks/use-privacy"

const cashflowData = {
  currentMonth: {
    inflow: 342500,
    outflow: 187300,
    netFlow: 155200
  },
  previousMonth: {
    inflow: 298000,
    outflow: 165200,
    netFlow: 132800
  },
  projection: {
    nextMonthInflow: 385000,
    nextMonthOutflow: 195000,
    nextMonthNet: 190000
  },
  breakdown: {
    inflow: [
      { source: "Client Payments", amount: 285000, percentage: 83.2 },
      { source: "Investment Returns", amount: 32500, percentage: 9.5 },
      { source: "Other Income", amount: 25000, percentage: 7.3 }
    ],
    outflow: [
      { source: "Operational Expenses", amount: 98700, percentage: 52.7 },
      { source: "Software & Technology", amount: 35600, percentage: 19.0 },
      { source: "Professional Services", amount: 28000, percentage: 14.9 },
      { source: "Other Expenses", amount: 25000, percentage: 13.4 }
    ]
  }
}

export function CashflowTracker() {
  const { maskValue, isPrivacyMode } = usePrivacy()
  
  const netFlowChange = cashflowData.currentMonth.netFlow - cashflowData.previousMonth.netFlow
  const netFlowPercentage = ((netFlowChange / cashflowData.previousMonth.netFlow) * 100).toFixed(1)
  const isPositiveFlow = netFlowChange > 0

  return (
    <Card.Root>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <Card.Title className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Cash Flow Tracker
            </Card.Title>
            <Card.Description>
              Real-time cash flow analysis and projections
            </Card.Description>
          </div>
          <Badge variant={isPositiveFlow ? "solid" : "solid"} colorScheme={isPositiveFlow ? "green" : "red"} className="flex items-center gap-1">
            {isPositiveFlow ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositiveFlow ? "+" : ""}{netFlowPercentage}% vs last month
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          {/* Current Month Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUp className="h-4 w-4 text-green-600" />
                Cash Inflow
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${isPrivacyMode ? maskValue(cashflowData.currentMonth.inflow) : cashflowData.currentMonth.inflow.toLocaleString('en-CA')} CAD
              </p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowDown className="h-4 w-4 text-red-600" />
                Cash Outflow
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${isPrivacyMode ? maskValue(cashflowData.currentMonth.outflow) : cashflowData.currentMonth.outflow.toLocaleString('en-CA')} CAD
              </p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                Net Cash Flow
              </div>
              <p className={`text-2xl font-bold ${isPositiveFlow ? 'text-green-600' : 'text-red-600'}`}>
                ${isPrivacyMode ? maskValue(cashflowData.currentMonth.netFlow) : cashflowData.currentMonth.netFlow.toLocaleString('en-CA')} CAD
              </p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </div>

          {/* Cash Flow Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-green-600">Inflow Sources</h4>
              {cashflowData.breakdown.inflow.map((item) => (
                <div key={item.source} className="flex justify-between items-center">
                  <span className="text-sm">{item.source}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${isPrivacyMode ? maskValue(item.amount) : item.amount.toLocaleString('en-CA')}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-red-600">Outflow Categories</h4>
              {cashflowData.breakdown.outflow.map((item) => (
                <div key={item.source} className="flex justify-between items-center">
                  <span className="text-sm">{item.source}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${isPrivacyMode ? maskValue(item.amount) : item.amount.toLocaleString('en-CA')}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Month Projection */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Next Month Projection</h4>
              <Badge variant="outline">Estimated</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Expected Inflow</p>
                <p className="font-semibold text-green-600">
                  ${isPrivacyMode ? maskValue(cashflowData.projection.nextMonthInflow) : cashflowData.projection.nextMonthInflow.toLocaleString('en-CA')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Expected Outflow</p>
                <p className="font-semibold text-red-600">
                  ${isPrivacyMode ? maskValue(cashflowData.projection.nextMonthOutflow) : cashflowData.projection.nextMonthOutflow.toLocaleString('en-CA')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Projected Net Flow</p>
                <p className="font-semibold text-primary">
                  ${isPrivacyMode ? maskValue(cashflowData.projection.nextMonthNet) : cashflowData.projection.nextMonthNet.toLocaleString('en-CA')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  )
}