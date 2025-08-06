import { Header } from "@/components/ui/header"
import { LedgerTable } from "@/components/ledger/ledger-table"
import { AccountSummary } from "@/components/ledger/account-summary"
import { LedgerFilters } from "@/components/ledger/ledger-filters"
import { ReconciliationDialog } from "@/components/ledger/reconciliation-dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface LedgerFilters {
  accountId: string
  dateRange: { from: Date | undefined; to: Date | undefined }
  transactionType: 'all' | 'income' | 'expense' | 'transfer'
  reconciliationStatus: 'all' | 'reconciled' | 'unreconciled'
  searchQuery: string
}

const Ledger = () => {
  const [filters, setFilters] = useState<LedgerFilters>({
    accountId: "all",
    dateRange: { from: undefined, to: undefined },
    transactionType: "all",
    reconciliationStatus: "all",
    searchQuery: ""
  })

  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const handleOpenReconciliation = (accountId?: string) => {
    setSelectedAccountId(accountId || null)
    setIsReconciliationOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 md:px-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden bg-gradient-hero rounded-2xl p-6 md:p-8 shadow-lg animate-fade-in">
            <div className="absolute inset-0 bg-gradient-glass backdrop-blur-sm"></div>
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-card/20 backdrop-blur-sm rounded-xl">
                      <RotateCcw className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
                      Bank Ledger
                    </h1>
                  </div>
                  <p className="text-primary-foreground/90 max-w-2xl">
                    Complete transaction ledger with running balances, real-time reconciliation, and double-entry bookkeeping
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/30"
                    onClick={() => handleOpenReconciliation()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reconcile All
                  </Button>
                  <Button 
                    variant="secondary"
                    className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Summary Cards */}
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <AccountSummary />
          </div>

          {/* Filters */}
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <LedgerFilters 
              filters={filters} 
              onFiltersChange={setFilters}
            />
          </div>

          {/* Main Ledger Table */}
          <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Transaction Ledger</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    Real-time updates enabled
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <LedgerTable 
                  filters={filters}
                  onReconcileTransaction={handleOpenReconciliation}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Reconciliation Dialog */}
      <ReconciliationDialog
        isOpen={isReconciliationOpen}
        onClose={() => setIsReconciliationOpen(false)}
        accountId={selectedAccountId}
      />
    </div>
  )
}

export default Ledger