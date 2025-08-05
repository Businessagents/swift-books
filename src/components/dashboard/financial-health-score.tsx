import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { usePrivacy } from "@/hooks/use-privacy"

interface HealthMetric {
  name: string
  score: number
  weight: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  trend: 'up' | 'down' | 'stable'
  description: string
  recommendation?: string
}

export function FinancialHealthScore() {
  const { maskValue, isPrivacyMode } = usePrivacy()

  const metrics: HealthMetric[] = [
    {
      name: "Cash Flow",
      score: 92,
      weight: 0.3,
      status: 'excellent',
      trend: 'up',
      description: "Strong positive cash flow trend",
      recommendation: "Continue monitoring monthly patterns"
    },
    {
      name: "Revenue Growth",
      score: 78,
      weight: 0.25,
      status: 'good',
      trend: 'up',
      description: "Steady growth over past 3 months",
      recommendation: "Focus on client retention strategies"
    },
    {
      name: "Expense Control",
      score: 65,
      weight: 0.2,
      status: 'fair',
      trend: 'down',
      description: "Expenses increasing faster than revenue",
      recommendation: "Review and optimize recurring expenses"
    },
    {
      name: "Payment Collection",
      score: 88,
      weight: 0.15,
      status: 'excellent',
      trend: 'stable',
      description: "Low outstanding receivables",
      recommendation: "Maintain current collection processes"
    },
    {
      name: "Tax Compliance",
      score: 95,
      weight: 0.1,
      status: 'excellent',
      trend: 'stable',
      description: "All filings up to date",
      recommendation: "Continue quarterly reviews"
    }
  ]

  // Calculate overall health score
  const overallScore = Math.round(
    metrics.reduce((total, metric) => total + (metric.score * metric.weight), 0)
  )

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 55) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-green-500 to-green-600"
    if (score >= 70) return "from-yellow-500 to-yellow-600"
    if (score >= 55) return "from-orange-500 to-orange-600"
    return "from-red-500 to-red-600"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Excellent</Badge>
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Good</Badge>
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Fair</Badge>
      case 'poor':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Poor</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Financial Health Score
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-r from-muted to-muted/50 flex items-center justify-center">
              <div className={`w-28 h-28 rounded-full bg-gradient-to-r ${getScoreGradient(overallScore)} flex items-center justify-center`}>
                <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                      {isPrivacyMode ? '••' : overallScore}
                    </div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {overallScore >= 85 ? 'Excellent' : overallScore >= 70 ? 'Good' : overallScore >= 55 ? 'Fair' : 'Needs Attention'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your business is {overallScore >= 70 ? 'financially healthy' : 'showing areas for improvement'}
            </p>
          </div>
        </div>

        {/* Metric Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Health Metrics</h4>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(metric.status)}
                    <span className={`font-medium ${getScoreColor(metric.score)}`}>
                      {isPrivacyMode ? '••' : metric.score}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={isPrivacyMode ? 75 : metric.score} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                {metric.recommendation && metric.score < 80 && (
                  <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Recommendation:</span> {metric.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button size="sm" className="flex-1">
            Get Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}