import { Card, CardBody } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LedgerFilters as LedgerFiltersType } from "@/pages/Ledger"
import { Search, CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface LedgerFiltersProps {
  filters: LedgerFiltersType
  onFiltersChange: (filters: LedgerFiltersType) => void
}

export function LedgerFilters({ filters, onFiltersChange }: LedgerFiltersProps) {
  // Fetch bank accounts for filter
  const { data: accounts = [] } = useQuery({
    queryKey: ['bank-accounts-filter'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('bank_accounts')
        .select('id, account_name, institution_name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('account_name')

      if (error) throw error
      return data
    }
  })

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        from: range?.from,
        to: range?.to
      }
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      accountId: "all",
      dateRange: { from: undefined, to: undefined },
      transactionType: "all",
      reconciliationStatus: "all",
      searchQuery: ""
    })
  }

  const hasActiveFilters = 
    filters.accountId !== "all" ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.transactionType !== "all" ||
    filters.reconciliationStatus !== "all" ||
    filters.searchQuery

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
      <CardBody className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions, descriptions, vendors..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          {/* Account Filter */}
          <Select
            value={filters.accountId}
            onChange={(e) => onFiltersChange({ ...filters, accountId: e.target.value })}
            className="w-[200px] bg-background/50 backdrop-blur-sm border-border/50"
            placeholder="All Accounts"
          >
            <option value="all">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name}
              </option>
            ))}
          </Select>

          {/* Transaction Type Filter */}
          <Select
            value={filters.transactionType}
            onChange={(e) => onFiltersChange({ ...filters, transactionType: e.target.value as any })}
            className="w-[150px] bg-background/50 backdrop-blur-sm border-border/50"
            placeholder="Type"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </Select>

          {/* Reconciliation Status Filter */}
          <Select
            value={filters.reconciliationStatus}
            onChange={(e) => onFiltersChange({ ...filters, reconciliationStatus: e.target.value as any })}
            className="w-[150px] bg-background/50 backdrop-blur-sm border-border/50"
            placeholder="Status"
          >
            <option value="all">All Status</option>
            <option value="reconciled">Reconciled</option>
            <option value="unreconciled">Unreconciled</option>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal bg-background/50 backdrop-blur-sm border-border/50"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "MMM dd")} -{" "}
                      {format(filters.dateRange.to, "MMM dd")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card/95 backdrop-blur-sm border-border/50" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to
                }}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                className="bg-transparent"
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Filter className="h-3 w-3" />
              Active filters:
            </div>
            
            {filters.accountId !== "all" && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                Account: {accounts.find(a => a.id === filters.accountId)?.account_name || filters.accountId}
              </div>
            )}
            
            {filters.transactionType !== "all" && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                Type: {filters.transactionType}
              </div>
            )}
            
            {filters.reconciliationStatus !== "all" && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                Status: {filters.reconciliationStatus}
              </div>
            )}
            
            {(filters.dateRange.from || filters.dateRange.to) && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                Date: {filters.dateRange.from && format(filters.dateRange.from, "MMM dd")}
                {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              </div>
            )}
            
            {filters.searchQuery && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                Search: "{filters.searchQuery}"
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}