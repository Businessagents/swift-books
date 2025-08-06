import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Header } from "@/components/ui/header"
import { ReceiptUploadEnhanced } from "@/components/receipt-upload-enhanced"
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Download, 
  Trash2, 
  Plus, 
  Calendar,
  DollarSign,
  Tag,
  Check,
  Clock,
  X,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  ArrowUpDown
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { usePrivacy } from "@/hooks/use-privacy"

interface Receipt {
  id: string
  file_name: string
  file_path: string
  vendor_name: string | null
  total_amount: number | null
  tax_amount: number | null
  receipt_date: string | null
  status: 'pending' | 'processing' | 'processed' | 'categorized' | 'failed' | 'archived'
  ai_suggested_category: string | null
  ai_confidence: number | null
  ocr_text: string | null
  created_at: string
  updated_at: string
}

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null)
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const { maskValue } = usePrivacy()

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReceipts(data || [])
    } catch (error) {
      console.error('Error fetching receipts:', error)
      toast({
        title: "Error loading receipts",
        description: "Failed to load your receipts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReceiptProcessed = () => {
    fetchReceipts()
    setShowUploadDialog(false)
  }

  const deleteReceipt = async (receipt: Receipt) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('receipts')
        .remove([receipt.file_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receipt.id)

      if (dbError) throw dbError

      toast({
        title: "Receipt deleted",
        description: "The receipt has been permanently deleted.",
      })

      fetchReceipts()
    } catch (error) {
      console.error('Error deleting receipt:', error)
      toast({
        title: "Delete failed",
        description: "Failed to delete the receipt. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getReceiptImageUrl = (receipt: Receipt) => {
    const { data } = supabase.storage
      .from('receipts')
      .getPublicUrl(receipt.file_path)
    return data.publicUrl
  }

  const convertToExpense = async (receipt: Receipt) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Create expense from receipt data
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          receipt_id: receipt.id,
          description: `${receipt.vendor_name || 'Receipt'} - ${receipt.file_name}`,
          vendor: receipt.vendor_name,
          expense_date: receipt.receipt_date || new Date().toISOString().split('T')[0],
          amount: receipt.total_amount || 0,
          tax_amount: receipt.tax_amount || 0,
          currency: 'CAD',
          status: 'pending'
        })

      if (expenseError) throw expenseError

      // Update receipt status
      await supabase
        .from('receipts')
        .update({ status: 'categorized' })
        .eq('id', receipt.id)

      toast({
        title: "Expense created",
        description: "Receipt has been converted to an expense record.",
      })

      fetchReceipts()
    } catch (error) {
      console.error('Error converting to expense:', error)
      toast({
        title: "Conversion failed",
        description: "Failed to convert receipt to expense.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
      case 'categorized':
        return <Check className="h-4 w-4 text-success" />
      case 'processing':
        return <Clock className="h-4 w-4 text-warning animate-spin" />
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
      case 'categorized':
        return 'success'
      case 'processing':
        return 'warning'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatAmount = (amount: number | null) => {
    if (!amount) return '$0.00'
    return `$${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Filter and sort receipts
  const filteredReceipts = receipts
    .filter(receipt => {
      const matchesSearch = 
        receipt.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.ai_suggested_category?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'amount':
          comparison = (a.total_amount || 0) - (b.total_amount || 0)
          break
        case 'vendor':
          comparison = (a.vendor_name || '').localeCompare(b.vendor_name || '')
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Receipt Management</h1>
            <p className="text-muted-foreground">Upload, view, and manage your business receipts</p>
          </div>
          <Button 
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Receipt
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Receipts</p>
                  <p className="text-2xl font-bold">{receipts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processed</p>
                  <p className="text-2xl font-bold text-success">
                    {receipts.filter(r => ['processed', 'categorized'].includes(r.status)).length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold text-warning">
                    {receipts.filter(r => r.status === 'processing').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    {maskValue(formatAmount(receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0)))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="categorized">Categorized</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'vendor') => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipts Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-muted rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReceipts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No receipts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first receipt to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
          }>
            {filteredReceipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {viewMode === 'grid' ? (
                    <div className="space-y-4">
                      {/* Receipt Image Preview */}
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={getReceiptImageUrl(receipt)}
                          alt={receipt.file_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.style.display = 'none'
                            const sibling = target.nextElementSibling as HTMLElement
                            if (sibling) sibling.style.display = 'flex'
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span className="text-sm">Image unavailable</span>
                        </div>
                      </div>

                      {/* Receipt Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {maskValue(receipt.vendor_name || receipt.file_name)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(receipt.receipt_date || receipt.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(receipt.status)}
                            <Badge variant={getStatusColor(receipt.status) as any} className="text-xs">
                              {receipt.status}
                            </Badge>
                          </div>
                        </div>

                        {receipt.total_amount && (
                          <div className="text-lg font-bold">
                            {maskValue(formatAmount(receipt.total_amount))}
                          </div>
                        )}

                        {receipt.ai_suggested_category && (
                          <Badge variant="outline" className="text-xs">
                            {receipt.ai_suggested_category}
                          </Badge>
                        )}

                        {receipt.ai_confidence && (
                          <div className="text-xs text-muted-foreground">
                            AI Confidence: {Math.round(receipt.ai_confidence * 100)}%
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReceipt(receipt)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {['processed', 'categorized'].includes(receipt.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => convertToExpense(receipt)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Expense
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReceiptToDelete(receipt)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* List View */
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src={getReceiptImageUrl(receipt)}
                          alt={receipt.file_name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.style.display = 'none'
                            const sibling = target.nextElementSibling as HTMLElement
                            if (sibling) sibling.style.display = 'flex'
                          }}
                        />
                        <ImageIcon className="h-6 w-6 text-muted-foreground hidden" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium truncate">
                              {maskValue(receipt.vendor_name || receipt.file_name)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(receipt.receipt_date || receipt.created_at)}
                            </p>
                            {receipt.ai_suggested_category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {receipt.ai_suggested_category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {maskValue(formatAmount(receipt.total_amount))}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(receipt.status)}
                              <Badge variant={getStatusColor(receipt.status) as any} className="text-xs">
                                {receipt.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReceiptToDelete(receipt)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New Receipt</DialogTitle>
              <DialogDescription>
                Upload a receipt image for automatic processing and categorization.
              </DialogDescription>
            </DialogHeader>
            <ReceiptUploadEnhanced 
              onReceiptProcessed={handleReceiptProcessed}
              onExpenseCreated={handleReceiptProcessed}
            />
          </DialogContent>
        </Dialog>

        {/* Receipt Detail Dialog */}
        {selectedReceipt && (
          <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Receipt Details</DialogTitle>
                <DialogDescription>
                  View and manage receipt information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Receipt Image */}
                <div className="space-y-4">
                  <h3 className="font-medium">Receipt Image</h3>
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                    <img
                      src={getReceiptImageUrl(selectedReceipt)}
                      alt={selectedReceipt.file_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Receipt Info */}
                <div className="space-y-4">
                  <h3 className="font-medium">Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                      <p className="text-sm">{selectedReceipt.vendor_name || 'Not detected'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Amount</label>
                      <p className="text-sm">{maskValue(formatAmount(selectedReceipt.total_amount))}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tax Amount</label>
                      <p className="text-sm">{maskValue(formatAmount(selectedReceipt.tax_amount))}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date</label>
                      <p className="text-sm">
                        {selectedReceipt.receipt_date 
                          ? formatDate(selectedReceipt.receipt_date)
                          : 'Not detected'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedReceipt.status)}
                        <Badge variant={getStatusColor(selectedReceipt.status) as any}>
                          {selectedReceipt.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedReceipt.ai_suggested_category && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Category</label>
                        <p className="text-sm">{selectedReceipt.ai_suggested_category}</p>
                      </div>
                    )}
                    
                    {selectedReceipt.ai_confidence && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">AI Confidence</label>
                        <p className="text-sm">{Math.round(selectedReceipt.ai_confidence * 100)}%</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">File Name</label>
                      <p className="text-sm break-all">{selectedReceipt.file_name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Uploaded</label>
                      <p className="text-sm">{formatDate(selectedReceipt.created_at)}</p>
                    </div>
                  </div>

                  {/* OCR Text */}
                  {selectedReceipt.ocr_text && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Extracted Text</label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <p className="text-xs whitespace-pre-wrap font-mono">
                          {selectedReceipt.ocr_text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                {['processed', 'categorized'].includes(selectedReceipt.status) && (
                  <Button 
                    onClick={() => {
                      convertToExpense(selectedReceipt)
                      setSelectedReceipt(null)
                    }}
                  >
                    Convert to Expense
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this receipt? This action cannot be undone.
                The receipt file and all associated data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setReceiptToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (receiptToDelete) {
                    deleteReceipt(receiptToDelete)
                    setReceiptToDelete(null)
                    setShowDeleteDialog(false)
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Receipt
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}