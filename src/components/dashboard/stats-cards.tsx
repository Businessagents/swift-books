import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Clock, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Monthly Revenue",
    value: "$287,650",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    description: "CAD - Current month"
  },
  {
    title: "Collection Period",
    value: "24 days",
    change: "-6%",
    trend: "down",
    icon: Clock,
    description: "Average DSO this quarter"
  },
  {
    title: "Active Clients",
    value: "47",
    change: "+12%",
    trend: "up",
    icon: FileText,
    description: "Ongoing projects"
  },
  {
    title: "Outstanding Balance",
    value: "$43,280",
    change: "-15%",
    trend: "down",
    icon: AlertCircle,
    description: "Past due accounts"
  }
]

export function StatsCards() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.trend === "up" ? stat.title.includes("Outstanding") || stat.title.includes("Overdue") ? false : true : true
        
        return (
          <Card 
            key={stat.title} 
            className="relative overflow-hidden bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-scale-in group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200 group-hover:scale-110",
                stat.title.includes("Revenue") && "bg-gradient-success shadow-success",
                stat.title.includes("Collection") && "bg-gradient-primary shadow-primary", 
                stat.title.includes("Clients") && "bg-gradient-warning shadow-warning",
                stat.title.includes("Outstanding") && "bg-gradient-destructive shadow-destructive"
              )}>
                <Icon className="h-4 w-4 text-white flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={cn(
                "text-2xl md:text-3xl font-bold transition-all duration-200",
                stat.title.includes("Revenue") && "bg-gradient-success bg-clip-text text-transparent",
                stat.title.includes("Collection") && "text-primary",
                stat.title.includes("Clients") && "bg-gradient-warning bg-clip-text text-transparent",
                stat.title.includes("Outstanding") && "text-destructive"
              )}>
                {stat.value}
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={isPositive ? "default" : "destructive"} 
                  className={cn(
                    "flex items-center gap-1 text-xs transition-all duration-200",
                    isPositive ? "bg-success/10 text-success border-success/20 hover:bg-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </CardContent>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Card>
        )
      })}
    </div>
  )
}