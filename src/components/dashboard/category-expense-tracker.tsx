import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, TrendingUp, Receipt, Plus, Filter } from "lucide-react"
import { useState } from "react"
import { usePrivacy } from "@/hooks/use-privacy"

const expenseCategories = [
  {
    name: "Software & Technology",
    total: 35600,
    budget: 40000,
    count: 12,
    trend: "+8.5%",
    expenses: [
      { description: "Microsoft Office 365 Business", amount: 1299, date: "2024-01-28", vendor: "Microsoft Canada" },
      { description: "Adobe Creative Cloud Team", amount: 2400, date: "2024-01-25", vendor: "Adobe Systems" },
      { description: "AWS Cloud Infrastructure", amount: 8900, date: "2024-01-24", vendor: "Amazon Web Services" },
      { description: "Slack Pro Subscription", amount: 450, date: "2024-01-22", vendor: "Slack Technologies" },
      { description: "GitHub Enterprise", amount: 1800, date: "2024-01-20", vendor: "GitHub Inc" }
    ]
  },
  {
    name: "Travel & Transportation", 
    total: 18750,
    budget: 25000,
    count: 8,
    trend: "-12.3%",
    expenses: [
      { description: "Flight to Vancouver (YVR)", amount: 6800, date: "2024-01-26", vendor: "Air Canada" },
      { description: "Hotel - Fairmont Pacific Rim", amount: 4200, date: "2024-01-25", vendor: "Fairmont Hotels" },
      { description: "GO Transit Monthly Pass", amount: 156, date: "2024-01-15", vendor: "Metrolinx" },
      { description: "Uber Business Trips", amount: 275, date: "2024-01-20", vendor: "Uber Canada" },
      { description: "Petro-Canada Station", amount: 89, date: "2024-01-18", vendor: "Petro-Canada" }
    ]
  },
  {
    name: "Meals & Entertainment",
    total: 12400,
    budget: 15000,
    count: 15,
    trend: "+5.2%", 
    expenses: [
      { description: "Client Dinner - The Keg", amount: 485, date: "2024-01-29", vendor: "The Keg Steakhouse" },
      { description: "Team Lunch - Boston Pizza", amount: 267, date: "2024-01-27", vendor: "Boston Pizza" },
      { description: "Coffee Meeting - Tim Hortons", amount: 18, date: "2024-01-25", vendor: "Tim Hortons" },
      { description: "Business Lunch - Earls", amount: 156, date: "2024-01-23", vendor: "Earls Kitchen + Bar" },
      { description: "Conference Catering", amount: 890, date: "2024-01-21", vendor: "Fresh Catering" }
    ]
  },
  {
    name: "Office Supplies",
    total: 3200,
    budget: 5000,
    count: 6,
    trend: "-15.1%",
    expenses: [
      { description: "Staples Office Supplies", amount: 145, date: "2024-01-24", vendor: "Staples Canada" },
      { description: "Printer Paper & Cartridges", amount: 89, date: "2024-01-22", vendor: "Best Buy Canada" },
      { description: "Desk Setup Equipment", amount: 567, date: "2024-01-19", vendor: "IKEA Canada" }
    ]
  }
]

export function CategoryExpenseTracker() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const { maskValue, isPrivacyMode } = usePrivacy()

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.total, 0)
  const totalBudget = expenseCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const budgetUtilization = ((totalExpenses / totalBudget) * 100).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Expense Categories
            </CardTitle>
            <CardDescription>
              Track expenses by category with budget comparison
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-semibold">
                ${isPrivacyMode ? maskValue(totalExpenses) : totalExpenses.toLocaleString('en-CA')} CAD
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-lg font-semibold">
                ${isPrivacyMode ? maskValue(totalBudget) : totalBudget.toLocaleString('en-CA')} CAD
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-lg font-semibold text-primary">{budgetUtilization}%</p>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2">
            {expenseCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.name)
              const budgetPercentage = ((category.total / category.budget) * 100).toFixed(1)
              const isOverBudget = category.total > category.budget
              
              return (
                <Collapsible key={category.name}>
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => toggleCategory(category.name)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{category.name}</p>
                            <Badge variant="outline">{category.count} items</Badge>
                            <Badge variant="solid" colorScheme={category.trend.startsWith('+') ? 'red' : 'green'} className="text-xs">
                              {category.trend.startsWith('+') ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : null}
                              {category.trend}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {budgetPercentage}% of budget used
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}>
                          ${isPrivacyMode ? maskValue(category.total) : category.total.toLocaleString('en-CA')} CAD
                        </p>
                        <p className="text-sm text-muted-foreground">
                          of ${isPrivacyMode ? maskValue(category.budget) : category.budget.toLocaleString('en-CA')} budget
                        </p>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="ml-7 mt-2 space-y-2 pb-2">
                      {category.expenses.map((expense, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded">
                          <div>
                            <p className="text-sm font-medium">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {isPrivacyMode ? maskValue(expense.vendor) : expense.vendor} • {expense.date}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            ${isPrivacyMode ? maskValue(expense.amount) : expense.amount.toLocaleString('en-CA')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}