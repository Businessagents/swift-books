import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GSTHSTReporting } from "@/components/reports/gst-hst-reporting"
import { BarChart3, TrendingUp, Download, Calendar, FileText, PieChart, Calculator, Brain, Zap } from "lucide-react"

const reports = [
  {
    title: "Profit & Loss Statement",
    description: "Comprehensive P&L for Q4 2023",
    type: "Financial",
    lastGenerated: "2024-01-15",
    status: "Ready"
  },
  {
    title: "Cash Flow Report",
    description: "Monthly cash flow analysis",
    type: "Financial", 
    lastGenerated: "2024-01-30",
    status: "Ready"
  },
  {
    title: "Tax Summary (CRA T4A)",
    description: "Annual tax preparation summary",
    type: "Tax",
    lastGenerated: "2024-01-10",
    status: "Ready"
  },
  {
    title: "Expense Analysis by Category",
    description: "Detailed expense breakdown and trends",
    type: "Operational",
    lastGenerated: "2024-01-28",
    status: "Processing"
  },
  {
    title: "Client Revenue Analysis",
    description: "Revenue by client and project performance",
    type: "Revenue",
    lastGenerated: "2024-01-25",
    status: "Ready"
  },
  {
    title: "Business Intelligence Dashboard",
    description: "KPI overview and business metrics",
    type: "Analytics",
    lastGenerated: "2024-01-30",
    status: "Ready"
  }
]

const quickInsights = [
  {
    title: "Revenue Growth",
    value: "+23.5%",
    description: "vs. previous quarter",
    trend: "up",
    icon: TrendingUp
  },
  {
    title: "Top Expense Category",
    value: "Software & Technology",
    description: "32% of total expenses",
    trend: "neutral",
    icon: PieChart
  },
  {
    title: "Outstanding Receivables",
    value: "$156,700 CAD",
    description: "Average 18 days overdue",
    trend: "down",
    icon: BarChart3
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Ready":
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ready</Badge>
    case "Processing":
      return <Badge variant="secondary">Processing</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "Financial":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Tax":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "Operational":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Revenue":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Analytics":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

const Reports = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden bg-gradient-hero rounded-2xl p-6 md:p-8 shadow-lg animate-fade-in">
            <div className="absolute inset-0 bg-gradient-glass backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-card/20 backdrop-blur-sm rounded-xl">
                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
                    Financial Reports
                  </h1>
                </div>
                <p className="text-primary-foreground/90 max-w-2xl">
                  AI-powered business intelligence reports and CRA-compliant tax reporting with real-time insights
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <Button variant="secondary" className="bg-card/20 backdrop-blur-sm border-primary-foreground/20">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
                <Button variant="secondary" className="bg-card/20 backdrop-blur-sm border-primary-foreground/20">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Insights */}
          <div className="grid gap-4 md:grid-cols-3 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            {quickInsights.map((insight) => {
              const Icon = insight.icon
              return (
                <Card key={insight.title} className="bg-gradient-card border-border/50 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {insight.trend === "up" && (
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="h-4 w-4" />
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            Improving
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{insight.value}</p>
                      <p className="text-sm font-medium text-foreground">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Reports Content */}
          <Tabs defaultValue="gst-hst" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gst-hst" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                GST/HST Reporting
              </TabsTrigger>
              <TabsTrigger value="standard" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Standard Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gst-hst" className="space-y-4">
              <GSTHSTReporting />
            </TabsContent>

            <TabsContent value="standard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Reports</CardTitle>
                  <CardDescription>
                    Generate, view, and download business reports
                  </CardDescription>
                </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.title}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{report.title}</p>
                          <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Last generated: {report.lastGenerated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" disabled={report.status !== "Ready"}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Reports;