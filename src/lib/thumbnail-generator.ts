/**
 * Client-side thumbnail generation utility
 * Generates thumbnails for receipt images before upload to improve performance
 */

export interface ThumbnailOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/jpeg' | 'image/webp' | 'image/png'
}

export interface ThumbnailResult {
  file: File
  dataUrl: string
  width: number
  height: number
  originalSize: number
  thumbnailSize: number
  compressionRatio: number
}

export class ThumbnailGenerator {
  private static instance: ThumbnailGenerator
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    const context = this.canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas 2D context not available')
    }
    this.ctx = context
  }

  static getInstance(): ThumbnailGenerator {
    if (!ThumbnailGenerator.instance) {
      ThumbnailGenerator.instance = new ThumbnailGenerator()
    }
    return ThumbnailGenerator.instance
  }

  /**
   * Generate a thumbnail from a File object
   */
  async generateThumbnail(
    file: File,
    options: ThumbnailOptions = {}
  ): Promise<ThumbnailResult> {
    const {
      maxWidth = 400,
      maxHeight = 300,
      quality = 0.8,
      format = 'image/jpeg'
    } = options

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          )

          // Set canvas size
          this.canvas.width = width
          this.canvas.height = height

          // Clear canvas and draw image
          this.ctx.clearRect(0, 0, width, height)
          this.ctx.imageSmoothingEnabled = true
          this.ctx.imageSmoothingQuality = 'high'
          this.ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          this.canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to generate thumbnail blob'))
                return
              }

              // Create file from blob
              const thumbnailFile = new File(
                [blob],
                this.generateThumbnailFileName(file.name),
                { type: format }
              )

              // Get data URL for preview
              const dataUrl = this.canvas.toDataURL(format, quality)

              // Calculate compression ratio
              const compressionRatio = (file.size - blob.size) / file.size

              resolve({
                file: thumbnailFile,
                dataUrl,
                width,
                height,
                originalSize: file.size,
                thumbnailSize: blob.size,
                compressionRatio
              })
            },
            format,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image for thumbnail generation'))
      }

      // Load the image
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file for thumbnail generation'))
      }
      reader.readAsDataURL(file)
    })
  }

  /**
   * Generate multiple thumbnail sizes at once
   */
  async generateMultipleThumbnails(
    file: File,
    sizes: ThumbnailOptions[]
  ): Promise<ThumbnailResult[]> {
    const results: ThumbnailResult[] = []
    
    for (const options of sizes) {
      try {
        const result = await this.generateThumbnail(file, options)
        results.push(result)
      } catch (error) {
        console.error('Failed to generate thumbnail:', error)
        // Continue with other sizes even if one fails
      }
    }
    
    return results
  }

  /**
   * Check if a file needs thumbnailing based on size and dimensions
   */
  async shouldGenerateThumbnail(
    file: File,
    maxFileSize: number = 500 * 1024, // 500KB
    maxDimensions: { width: number; height: number } = { width: 800, height: 600 }
  ): Promise<{ needsThumbnail: boolean; dimensions?: { width: number; height: number } }> {
    // Always generate thumbnail if file is large
    if (file.size > maxFileSize) {
      return { needsThumbnail: true }
    }

    // Check image dimensions
    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        const needsThumbnail = 
          img.width > maxDimensions.width || 
          img.height > maxDimensions.height

        resolve({
          needsThumbnail,
          dimensions: { width: img.width, height: img.height }
        })
      }

      img.onerror = () => {
        // If we can't load the image, assume it needs processing
        resolve({ needsThumbnail: true })
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => {
        resolve({ needsThumbnail: true })
      }
      reader.readAsDataURL(file)
    })
  }

  /**
   * Calculate new dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight

    // Scale down to fit within max dimensions
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height)
    }
  }

  /**
   * Generate thumbnail filename
   */
  private generateThumbnailFileName(originalFileName: string): string {
    const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '')
    const ext = originalFileName.split('.').pop() || 'jpg'
    return `${nameWithoutExt}_thumb.${ext}`
  }

  /**
   * Create a preview data URL from file (without resizing)
   */
  static async createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('Failed to create preview URL'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Estimate the final file size before generating thumbnail
   */
  static estimateThumbnailSize(
    originalSize: number,
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): number {
    const generator = new ThumbnailGenerator()
    const { width, height } = generator.calculateDimensions(
      originalWidth,
      originalHeight,
      maxWidth,
      maxHeight
    )

    // Rough estimation based on pixel reduction and quality
    const pixelReduction = (width * height) / (originalWidth * originalHeight)
    const qualityFactor = quality * 0.7 + 0.3 // Quality affects compression
    
    return Math.floor(originalSize * pixelReduction * qualityFactor)
  }
}

// Export singleton instance for easy use
export const thumbnailGenerator = ThumbnailGenerator.getInstance()

// Common thumbnail size presets
export const THUMBNAIL_PRESETS = {
  SMALL: { maxWidth: 200, maxHeight: 150, quality: 0.7 },
  MEDIUM: { maxWidth: 400, maxHeight: 300, quality: 0.8 },
  LARGE: { maxWidth: 800, maxHeight: 600, quality: 0.85 },
  PREVIEW: { maxWidth: 150, maxHeight: 100, quality: 0.6 }
} as const