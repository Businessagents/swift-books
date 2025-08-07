import { useState, useEffect } from 'react'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Download, Eye, EyeOff, Maximize2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { getSignedUrl, getThumbnailUrl } from '@/lib/storage-utils'

interface ReceiptImageProps {
  receiptId: string
  filePath: string
  fileName: string
  fileSize?: number
  status?: string
  className?: string
  showControls?: boolean
  onDelete?: () => void
}

// No need for local cache anymore, using storage-utils cache

export function ReceiptImage({ 
  receiptId, 
  filePath, 
  fileName, 
  fileSize, 
  status,
  className = '',
  showControls = true,
  onDelete 
}: ReceiptImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullImage, setShowFullImage] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { toast } = useToast()


  const loadImage = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load both thumbnail and full image URLs using improved utilities
      const [thumbUrl, fullUrl] = await Promise.all([
        getThumbnailUrl(filePath).catch((err) => {
          console.log('Thumbnail not available:', err.message)
          return null
        }),
        getSignedUrl('receipts', filePath).catch((err) => {
          console.error('Failed to load original image:', err)
          throw err
        })
      ])

      setThumbnailUrl(thumbUrl)
      setImageUrl(fullUrl)
    } catch (err: any) {
      console.error('Error loading receipt image:', err)
      setError(err.message || 'Failed to load image')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!imageUrl) return

    try {
      // Get a download URL (different from display URL)
      const downloadUrl = await getSignedUrl('receipts', filePath, { download: true })
      
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Download started',
        description: `Downloading ${fileName}`,
      })
    } catch (err: any) {
      console.error('Download failed:', err)
      toast({
        title: 'Download failed',
        description: err.message || 'Failed to download the receipt image',
        variant: 'destructive',
      })
    }
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadgeProps = (status?: string) => {
    switch (status) {
      case 'processed':
        return { variant: 'default' as const, text: 'Processed' }
      case 'processing':
        return { variant: 'secondary' as const, text: 'Processing...' }
      case 'failed':
        return { variant: 'destructive' as const, text: 'Failed' }
      case 'categorized':
        return { variant: 'default' as const, text: 'Categorized' }
      default:
        return { variant: 'secondary' as const, text: 'Pending' }
    }
  }

  useEffect(() => {
    loadImage()
  }, [filePath])

  if (loading) {
    return (
      <Card className={className}>
        <CardBody className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardBody className="p-4">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadImage}
            className="w-full"
          >
            Retry
          </Button>
        </CardBody>
      </Card>
    )
  }

  const statusProps = getStatusBadgeProps(status)
  const displayUrl = thumbnailUrl || imageUrl

  return (
    <>
      <Card className={className}>
        <CardBody className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium text-sm truncate" title={fileName}>
                  {fileName}
                </p>
                {fileSize && (
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileSize)}
                  </p>
                )}
              </div>
              <Badge variant={statusProps.variant}>
                {statusProps.text}
              </Badge>
            </div>

            {/* Image Display */}
            {isVisible && displayUrl && (
              <div className="relative group">
                <img
                  src={displayUrl}
                  alt={fileName}
                  className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowFullImage(true)}
                  onError={(e) => {
                    // Fallback to full image if thumbnail fails
                    if (thumbnailUrl && e.currentTarget.src === thumbnailUrl) {
                      e.currentTarget.src = imageUrl || ''
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </div>
            )}

            {/* Controls */}
            {showControls && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVisibility}
                  className="flex items-center gap-2"
                >
                  {isVisible ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      Show
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  disabled={!imageUrl}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullImage(true)}
                  disabled={!displayUrl}
                  className="flex items-center gap-2"
                >
                  <Maximize2 className="h-3 w-3" />
                  View
                </Button>

                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    className="flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Full Image Dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{fileName}</DialogTitle>
          </DialogHeader>
          {imageUrl && (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt={fileName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}