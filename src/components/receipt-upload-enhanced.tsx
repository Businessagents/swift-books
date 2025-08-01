import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Upload, Check, Clock, X, AlertCircle, Edit3 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptUploadProps {
  onReceiptProcessed?: (receipt: any) => void
  onExpenseCreated?: (expense: any) => void
}

interface ExtractedData {
  vendor: string
  amount: number | null
  tax: number | null
  date: string
  category: string
  confidence: number
}

const EXPENSE_CATEGORIES = [
  { code: 'OFFICE', name: 'Office Supplies & Equipment' },
  { code: 'TRAVEL', name: 'Business Travel & Transportation' },
  { code: 'MEALS', name: 'Business Entertainment & Meals' },
  { code: 'PROFESSIONAL', name: 'Professional Services' },
  { code: 'SUPPLIES', name: 'Software & Subscriptions' },
  { code: 'ADVERTISING', name: 'Marketing & Advertising' },
  { code: 'TELEPHONE', name: 'Utilities & Communications' },
  { code: 'MOTOR_VEHICLE', name: 'Vehicle & Fuel' },
  { code: 'INSURANCE', name: 'Insurance' },
  { code: 'OTHER', name: 'Other Business Expenses' }
]

const TAX_CODES = [
  { code: 'GST_5', name: 'GST 5%', rate: 0.05 },
  { code: 'HST_13', name: 'HST 13%', rate: 0.13 },
  { code: 'HST_15', name: 'HST 15%', rate: 0.15 },
  { code: 'NO_TAX', name: 'No Tax', rate: 0.00 }
]

export function ReceiptUploadEnhanced({ onReceiptProcessed, onExpenseCreated }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [reviewData, setReviewData] = useState<any>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 4MB",
        variant: "destructive",
      })
      return
    }

    await processReceipt(file)
  }

  const processReceipt = async (file: File) => {
    try {
      setUploading(true)
      setProgress(20)

      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to upload receipts')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      setProgress(40)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      setProgress(60)

      // Create receipt record in database
      const { data: receiptRecord, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending'
        })
        .select()
        .single()

      if (receiptError) {
        throw receiptError
      }

      setProgress(80)
      setUploading(false)
      setProcessing(true)

      // Convert file to base64 for OCR processing
      const base64 = await fileToBase64(file)
      
      // Call OCR processing function
      const { data: ocrData, error: ocrError } = await supabase.functions.invoke(
        'process-receipt-ocr',
        {
          body: {
            receiptId: receiptRecord.id,
            imageData: base64
          }
        }
      )

      if (ocrError) {
        throw ocrError
      }

      setProgress(100)
      setProcessing(false)

      // Store extracted data for review
      const extracted: ExtractedData = {
        vendor: ocrData.extractedData.vendor || '',
        amount: ocrData.extractedData.amount || null,
        tax: ocrData.extractedData.tax || null,
        date: ocrData.extractedData.date || new Date().toISOString().split('T')[0],
        category: ocrData.categoryData.category || 'Other Business Expenses',
        confidence: ocrData.categoryData.confidence || 0.6
      }

      setExtractedData(extracted)
      setReceiptData(receiptRecord)
      setReviewData({
        description: `${extracted.vendor} - Receipt`,
        vendor: extracted.vendor,
        expense_date: extracted.date,
        amount: extracted.amount?.toString() || '',
        tax_amount: extracted.tax?.toString() || '0',
        category_id: '', // Will be set based on category selection
        tax_code_id: '', // Will be set based on tax selection
        notes: '',
        is_billable: false,
        is_personal: false
      })

      // Show review dialog
      setShowReviewDialog(true)

      toast({
        title: "Receipt processed successfully!",
        description: `Extracted: ${extracted.vendor || 'Receipt'} - $${extracted.amount?.toFixed(2) || '0.00'}`,
      })

      // Notify parent component
      onReceiptProcessed?.(receiptRecord)

      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000)

    } catch (error: any) {
      console.error('Receipt processing error:', error)
      setUploading(false)
      setProcessing(false)
      setProgress(0)
      
      toast({
        title: "Failed to process receipt",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const createExpenseFromReceipt = async () => {
    try {
      if (!receiptData || !extractedData) return

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to create expenses')
      }

      // Get the selected category and tax code IDs
      const selectedCategory = EXPENSE_CATEGORIES.find(cat => cat.name === reviewData.category)
      const selectedTaxCode = TAX_CODES.find(tax => tax.name === reviewData.tax_code)

      // Create expense record
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          receipt_id: receiptData.id,
          description: reviewData.description,
          vendor: reviewData.vendor,
          expense_date: reviewData.expense_date,
          amount: parseFloat(reviewData.amount),
          tax_amount: parseFloat(reviewData.tax_amount),
          notes: reviewData.notes,
          is_billable: reviewData.is_billable,
          is_personal: reviewData.is_personal,
          payment_method: 'Credit Card', // Default value
          currency: 'CAD'
        })
        .select()
        .single()

      if (expenseError) {
        throw expenseError
      }

      // Update receipt status
      await supabase
        .from('receipts')
        .update({ status: 'categorized' })
        .eq('id', receiptData.id)

      toast({
        title: "Expense created successfully!",
        description: `${reviewData.vendor} expense has been added to your records.`,
      })

      // Close dialog and reset state
      setShowReviewDialog(false)
      setExtractedData(null)
      setReceiptData(null)
      setReviewData({})

      // Notify parent component
      onExpenseCreated?.(expenseData)

    } catch (error: any) {
      console.error('Expense creation error:', error)
      toast({
        title: "Failed to create expense",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  const isProcessingActive = uploading || processing

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Receipt Upload</CardTitle>
          <CardDescription>
            Scan or upload receipts for automatic categorization and expense creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress indicator */}
          {isProcessingActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Processing with AI...'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Upload area */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isProcessingActive ? 'opacity-50 pointer-events-none' : 'hover:border-primary/50 hover:bg-muted/50 cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!isProcessingActive ? openFileSelector : undefined}
          >
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                {isProcessingActive ? (
                  <Clock className="h-6 w-6 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm md:text-base">
                  {isProcessingActive ? 'Processing receipt...' : 'Drop receipt here or click to upload'}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Supports PNG, JPG, JPEG files up to 4MB
                </p>
              </div>
              
              {!isProcessingActive && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      openCamera()
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Camera</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openFileSelector()
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Browse Files</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-start space-x-2">
              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Automatic vendor detection</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
              <span>CRA-compliant categorization</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Tax amount extraction</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Automatic expense creation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Review Extracted Data
            </DialogTitle>
            <DialogDescription>
              Please review and edit the information extracted from your receipt before creating the expense.
            </DialogDescription>
          </DialogHeader>

          {extractedData && (
            <div className="space-y-4 py-4">
              {/* AI Confidence Badge */}
              <div className="flex items-center gap-2">
                <Badge variant={extractedData.confidence > 0.8 ? "default" : "secondary"}>
                  AI Confidence: {Math.round(extractedData.confidence * 100)}%
                </Badge>
                {extractedData.confidence < 0.7 && (
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Please verify extracted data</span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={reviewData.description}
                      onChange={(e) => setReviewData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Enter expense description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      value={reviewData.vendor}
                      onChange={(e) => setReviewData(prev => ({...prev, vendor: e.target.value}))}
                      placeholder="Vendor name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (CAD) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={reviewData.amount}
                      onChange={(e) => setReviewData(prev => ({...prev, amount: e.target.value}))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_amount">Tax Amount (CAD)</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      step="0.01"
                      value={reviewData.tax_amount}
                      onChange={(e) => setReviewData(prev => ({...prev, tax_amount: e.target.value}))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense_date">Date</Label>
                    <Input
                      id="expense_date"
                      type="date"
                      value={reviewData.expense_date}
                      onChange={(e) => setReviewData(prev => ({...prev, expense_date: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={reviewData.category} 
                      onValueChange={(value) => setReviewData(prev => ({...prev, category: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category.code} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_code">Tax Code</Label>
                    <Select 
                      value={reviewData.tax_code} 
                      onValueChange={(value) => setReviewData(prev => ({...prev, tax_code: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax code" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_CODES.map((tax) => (
                          <SelectItem key={tax.code} value={tax.name}>
                            {tax.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={reviewData.notes}
                    onChange={(e) => setReviewData(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Additional notes or details..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={reviewData.is_billable}
                      onChange={(e) => setReviewData(prev => ({...prev, is_billable: e.target.checked}))}
                      className="rounded border border-input"
                    />
                    <span className="text-sm">Billable to client</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={reviewData.is_personal}
                      onChange={(e) => setReviewData(prev => ({...prev, is_personal: e.target.checked}))}
                      className="rounded border border-input"
                    />
                    <span className="text-sm">Personal expense</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={createExpenseFromReceipt}
              disabled={!reviewData.description || !reviewData.amount}
              className="w-full sm:w-auto"
            >
              Create Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}