import { useState, useRef } from "react"
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, Check, Clock, X, AlertCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptUploadProps {
  onReceiptProcessed?: (receipt: any) => void
}

export function ReceiptUpload({ onReceiptProcessed }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
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
      const { data: receiptData, error: receiptError } = await supabase
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
            receiptId: receiptData.id,
            imageData: base64
          }
        }
      )

      if (ocrError) {
        throw ocrError
      }

      setProgress(100)
      setProcessing(false)

      toast({
        title: "Receipt processed successfully!",
        description: `Extracted ${ocrData.extractedData.vendor || 'receipt'} - $${ocrData.extractedData.amount || '0.00'}`,
      })

      // Notify parent component
      onReceiptProcessed?.(receiptData)

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
    <Card>
      <CardHeader>
        <CardTitle>Receipt Upload</CardTitle>
        <CardDescription>
          Scan or upload receipts for automatic categorization and tax processing
        </CardDescription>
      </CardHeader>
      <CardBody className="space-y-4">
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
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
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
              <h3 className="font-medium">
                {isProcessingActive ? 'Processing receipt...' : 'Drop receipt here or click to upload'}
              </h3>
              <p className="text-sm text-muted-foreground">
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

        {/* Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-start space-x-2">
            <Check className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
            <span>Automatic vendor detection</span>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
            <span>CRA-compliant categorization</span>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
            <span>Tax amount extraction</span>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
            <span>Secure cloud storage</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}