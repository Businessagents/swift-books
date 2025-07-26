import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Clock, FileText, AlertCircle } from "lucide-react"

const stats = [
  {
    title: "Outstanding AR",
    value: "$124,580",
    change: "-12%",
    trend: "down",
    icon: DollarSign,
    description: "vs last month"
  },
  {
    title: "Average DSO",
    value: "28 days",
    change: "-15%",
    trend: "down",
    icon: Clock,
    description: "6 days improvement"
  },
  {
    title: "Pending Invoices",
    value: "23",
    change: "+8%",
    trend: "up",
    icon: FileText,
    description: "requires follow-up"
  },
  {
    title: "Overdue Amount",
    value: "$18,420",
    change: "-22%",
    trend: "down",
    icon: AlertCircle,
    description: "recovery in progress"
  }
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isPositive = stat.trend === "up" ? stat.title.includes("Outstanding") || stat.title.includes("Overdue") ? false : true : true
        
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <Badge variant={isPositive ? "success" : "destructive"} className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}