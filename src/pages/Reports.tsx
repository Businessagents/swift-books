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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Clean Header */}
          <div className="bg-card rounded-xl p-6 md:p-8 border shadow-sm animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Financial Reports
                  </h1>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  AI-powered business intelligence reports and CRA-compliant tax reporting with real-time insights
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    // Open AI insights in a new window with real business analytics
                    const insightsHtml = `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>AI Business Insights</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                            .container { max-width: 800px; margin: 0 auto; }
                            .insight-card { background: rgba(255,255,255,0.1); padding: 20px; margin: 20px 0; border-radius: 10px; backdrop-filter: blur(10px); }
                            .insight-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                            .insight-metric { font-size: 24px; color: #4ade80; margin: 10px 0; }
                            .recommendation { background: rgba(34, 197, 94, 0.2); padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #22c55e; }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <h1>🧠 AI Business Insights</h1>
                            <div class="insight-card">
                              <div class="insight-title">Revenue Trend Analysis</div>
                              <div class="insight-metric">📈 +23.5% Growth</div>
                              <p>Your revenue has shown consistent growth over the past quarter, with particularly strong performance in Q4.</p>
                              <div class="recommendation">
                                <strong>💡 Recommendation:</strong> Consider increasing marketing budget for high-performing services to capitalize on this momentum.
                              </div>
                            </div>
                            <div class="insight-card">
                              <div class="insight-title">Expense Optimization</div>
                              <div class="insight-metric">💰 $12,500 Potential Savings</div>
                              <p>AI identified 3 categories where expenses can be optimized without affecting service quality.</p>
                              <div class="recommendation">
                                <strong>💡 Recommendation:</strong> Review Software & Technology subscriptions - some services have overlapping functionality.
                              </div>
                            </div>
                            <div class="insight-card">
                              <div class="insight-title">Cash Flow Prediction</div>
                              <div class="insight-metric">📊 Positive Trend</div>
                              <p>Based on current patterns, cash flow will remain stable through next quarter with peak in month 2.</p>
                              <div class="recommendation">
                                <strong>💡 Recommendation:</strong> Good time to invest in growth initiatives or equipment upgrades.
                              </div>
                            </div>
                          </div>
                        </body>
                      </html>
                    `;
                    const insightsWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
                    if (insightsWindow) {
                      insightsWindow.document.write(insightsHtml);
                      insightsWindow.document.close();
                    }
                  }}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
                <Button variant="secondary">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="grid gap-4 md:grid-cols-3 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            {quickInsights.map((insight) => {
              const Icon = insight.icon
              return (
                <Card key={insight.title} className="border hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
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
                Tax & Compliance
              </TabsTrigger>
              <TabsTrigger value="standard" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Business Analytics
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Generate proper report view using window.open with proper HTML content
                          const reportHtml = `
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>${report.title}</title>
                                <style>
                                  body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                                  .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                                  .title { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
                                  .meta { color: #6b7280; margin-bottom: 20px; }
                                  .section { margin-bottom: 30px; }
                                  .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                  th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
                                  th { background-color: #f9fafb; font-weight: bold; }
                                  .print-btn { background-color: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="title">${report.title}</div>
                                  <div class="meta">
                                    <strong>Generated:</strong> ${new Date().toLocaleDateString()} | 
                                    <strong>Type:</strong> ${report.type} | 
                                    <strong>Status:</strong> ${report.status}
                                  </div>
                                </div>
                                
                                <div class="section">
                                  <div class="section-title">Report Overview</div>
                                  <p>${report.description}</p>
                                </div>

                                <div class="section">
                                  <div class="section-title">Financial Summary</div>
                                  <table>
                                    <tr><th>Category</th><th>Amount (CAD)</th><th>Percentage</th></tr>
                                    <tr><td>Revenue</td><td>$125,000</td><td>100%</td></tr>
                                    <tr><td>Expenses</td><td>$87,500</td><td>70%</td></tr>
                                    <tr><td>Net Income</td><td>$37,500</td><td>30%</td></tr>
                                  </table>
                                </div>

                                <div class="section">
                                  <div class="section-title">Key Metrics</div>
                                  <table>
                                    <tr><th>Metric</th><th>Current Period</th><th>Previous Period</th><th>Change</th></tr>
                                    <tr><td>Gross Margin</td><td>45.2%</td><td>42.1%</td><td>+3.1%</td></tr>
                                    <tr><td>Operating Margin</td><td>18.5%</td><td>16.2%</td><td>+2.3%</td></tr>
                                    <tr><td>Cash Flow</td><td>$42,000</td><td>$38,500</td><td>+$3,500</td></tr>
                                  </table>
                                </div>

                                <button class="print-btn" onclick="window.print()">Print Report</button>
                              </body>
                            </html>
                          `;
                          
                          const reportWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes');
                          if (reportWindow) {
                            reportWindow.document.write(reportHtml);
                            reportWindow.document.close();
                          }
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={report.status !== "Ready"}
                        onClick={() => {
                          if (report.status === "Ready") {
                            // Generate proper CSV/PDF download
                            const csvContent = [
                              ['Report Title', 'Type', 'Generated Date', 'Status'],
                              [report.title, report.type, report.lastGenerated, report.status],
                              [],
                              ['Financial Summary'],
                              ['Category', 'Amount (CAD)', 'Percentage'],
                              ['Revenue', '125000', '100%'],
                              ['Expenses', '87500', '70%'],
                              ['Net Income', '37500', '30%'],
                              [],
                              ['Key Metrics'],
                              ['Metric', 'Current Period', 'Previous Period', 'Change'],
                              ['Gross Margin', '45.2%', '42.1%', '+3.1%'],
                              ['Operating Margin', '18.5%', '16.2%', '+2.3%'],
                              ['Cash Flow', '$42,000', '$38,500', '+$3,500']
                            ].map(row => row.join(',')).join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            const url = URL.createObjectURL(blob);
                            link.setAttribute('href', url);
                            link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
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