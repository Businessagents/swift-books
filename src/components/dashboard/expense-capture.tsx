import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Check, Clock, X } from "lucide-react"
import { ReceiptUpload } from "@/components/receipt-upload"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { usePrivacy } from "@/hooks/use-privacy"

const recentExpenses = [
  {
    id: 1,
    description: "Client lunch - The Keg Restaurant",
    amount: "$156.42",
    category: "Business Entertainment",
    date: "Jan 26, 2025",
    status: "processed",
    confidence: 0.97
  },
  {
    id: 2,
    description: "GO Transit - Union to Mississauga",
    amount: "$14.20",
    category: "Business Travel",
    date: "Jan 26, 2025",
    status: "processing",
    confidence: 0.94
  },
  {
    id: 3,
    description: "Microsoft Office 365 Business",
    amount: "$289.99",
    category: "Software & Subscriptions",
    date: "Jan 25, 2025", 
    status: "processed",
    confidence: 0.99
  },
  {
    id: 4,
    description: "Fuel - Petro-Canada Station",
    amount: "$87.35",
    category: "Vehicle & Fuel",
    date: "Jan 24, 2025", 
    status: "processed",
    confidence: 0.92
  }
]

export function ExpenseCapture() {
  const [recentReceipts, setRecentReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { maskValue } = usePrivacy()

  useEffect(() => {
    fetchRecentReceipts()
  }, [])

  const fetchRecentReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentReceipts(data || [])
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReceiptProcessed = (receipt: any) => {
    // Refresh the recent receipts list
    fetchRecentReceipts()
  }

  const formatAmount = (amount: number | null) => {
    if (!amount) return '$0.00'
    return `$${amount.toFixed(2)}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <Check className="h-4 w-4 text-success" />
      case 'processing':
        return <Clock className="h-4 w-4 text-warning animate-spin" />
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Receipt Upload Component */}
      <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
      
      {/* Recent Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
          <CardDescription>
            Your latest uploaded and processed receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-16" />
                    <div className="h-3 bg-muted rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No receipts uploaded yet</p>
              <p className="text-sm">Upload your first receipt to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReceipts.map((receipt) => (
                <div key={receipt.id} className="flex items-start sm:items-center justify-between p-3 rounded-lg border bg-card-elevated">
                  <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(receipt.status)}
                    </div>
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {maskValue(receipt.vendor_name || receipt.file_name || 'Unknown receipt')}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        {receipt.ai_suggested_category && (
                          <Badge variant="outline" className="text-xs w-fit">
                            {receipt.ai_suggested_category}
                          </Badge>
                        )}
                        {receipt.ai_confidence && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(receipt.ai_confidence * 100)}% confidence
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground capitalize">
                          {receipt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-semibold">
                      {maskValue(formatAmount(receipt.total_amount))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : 
                       new Date(receipt.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recentReceipts.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })} Summary
                </span>
                <span className="font-medium">
                  {maskValue(`${recentReceipts.length} receipts • ${formatAmount(
                    recentReceipts.reduce((sum, r) => sum + (r.total_amount || 0), 0)
                  )} CAD`)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}