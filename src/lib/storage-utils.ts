import { supabase } from '@/integrations/supabase/client'

/**
 * Storage utilities for handling receipt images and signed URLs
 */

interface SignedUrlOptions {
  expiresIn?: number // seconds, default 1800 (30 minutes)
  download?: boolean
  transform?: {
    width?: number
    height?: number
    quality?: number
  }
}

interface CachedSignedUrl {
  url: string
  expiresAt: number
  options: SignedUrlOptions
}

// In-memory cache for signed URLs
const signedUrlCache = new Map<string, CachedSignedUrl>()

// Cache cleanup interval (every 5 minutes)
let cacheCleanupInterval: NodeJS.Timeout | null = null

function startCacheCleanup() {
  if (cacheCleanupInterval) return
  
  cacheCleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, cached] of signedUrlCache.entries()) {
      if (cached.expiresAt <= now) {
        signedUrlCache.delete(key)
      }
    }
  }, 5 * 60 * 1000) // 5 minutes
}

function stopCacheCleanup() {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval)
    cacheCleanupInterval = null
  }
}

// Start cleanup when module loads
if (typeof window !== 'undefined') {
  startCacheCleanup()
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopCacheCleanup()
    signedUrlCache.clear()
  })
}

/**
 * Generate a signed URL for a storage object with caching
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  options: SignedUrlOptions = {}
): Promise<string> {
  const {
    expiresIn = 1800, // 30 minutes
    download = false,
    transform
  } = options

  // Create cache key based on path and options
  const cacheKey = `${bucket}:${path}:${JSON.stringify(options)}`
  
  // Check cache first
  const cached = signedUrlCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now() + 60000) { // Add 1 minute buffer
    return cached.url
  }

  try {
    // Generate new signed URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn, {
        download,
        transform: transform ? {
          width: transform.width,
          height: transform.height,
          quality: transform.quality
        } : undefined
      })

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned from storage')
    }

    // Cache the result (expire 1 minute before actual expiry for safety)
    signedUrlCache.set(cacheKey, {
      url: data.signedUrl,
      expiresAt: Date.now() + (expiresIn - 60) * 1000,
      options
    })

    return data.signedUrl

  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

/**
 * Get a thumbnail URL (tries thumbnail path first, falls back to original)
 */
export async function getThumbnailUrl(
  originalPath: string,
  options: SignedUrlOptions = {}
): Promise<string> {
  const thumbnailPath = `thumbnails/${originalPath}`
  
  try {
    // Try to get thumbnail first
    return await getSignedUrl('receipts', thumbnailPath, options)
  } catch (error) {
    console.log(`Thumbnail not found for ${originalPath}, falling back to original`)
    // Fall back to original image with transform options for resizing
    return await getSignedUrl('receipts', originalPath, {
      ...options,
      transform: {
        width: 400,
        height: 300,
        quality: 80,
        ...options.transform
      }
    })
  }
}

/**
 * Preload signed URLs for better UX
 */
export async function preloadSignedUrls(
  bucket: string,
  paths: string[],
  options: SignedUrlOptions = {}
): Promise<{ [path: string]: string }> {
  const results: { [path: string]: string } = {}
  
  const promises = paths.map(async (path) => {
    try {
      const url = await getSignedUrl(bucket, path, options)
      results[path] = url
    } catch (error) {
      console.error(`Failed to preload URL for ${path}:`, error)
    }
  })

  await Promise.allSettled(promises)
  return results
}

/**
 * Upload file with automatic thumbnail generation
 */
export async function uploadReceiptWithThumbnail(
  file: File,
  path: string,
  options: {
    generateThumbnail?: boolean
    thumbnailSize?: { width: number; height: number }
    onProgress?: (progress: number) => void
  } = {}
): Promise<{
  originalPath: string
  thumbnailPath?: string
  originalUrl: string
  thumbnailUrl?: string
}> {
  const { generateThumbnail = true, thumbnailSize = { width: 400, height: 300 } } = options

  try {
    options.onProgress?.(25)

    // Upload original file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(path, file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    options.onProgress?.(50)

    // Generate thumbnail if requested and file is an image
    let thumbnailPath: string | undefined
    if (generateThumbnail && file.type.startsWith('image/')) {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = URL.createObjectURL(file)
        })

        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height
        let { width, height } = thumbnailSize

        if (img.width > img.height) {
          height = width / aspectRatio
        } else {
          width = height * aspectRatio
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to blob
        const thumbnailBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8)
        })

        if (thumbnailBlob) {
          thumbnailPath = `thumbnails/${path}`
          const { error: thumbError } = await supabase.storage
            .from('receipts')
            .upload(thumbnailPath, thumbnailBlob, { upsert: true })

          if (thumbError) {
            console.warn('Thumbnail upload failed:', thumbError)
            thumbnailPath = undefined
          }
        }

        // Cleanup
        URL.revokeObjectURL(img.src)
      } catch (error) {
        console.warn('Thumbnail generation failed:', error)
      }
    }

    options.onProgress?.(75)

    // Generate signed URLs
    const originalUrl = await getSignedUrl('receipts', uploadData.path)
    const thumbnailUrl = thumbnailPath 
      ? await getSignedUrl('receipts', thumbnailPath)
      : undefined

    options.onProgress?.(100)

    return {
      originalPath: uploadData.path,
      thumbnailPath,
      originalUrl,
      thumbnailUrl
    }

  } catch (error) {
    console.error('Upload with thumbnail failed:', error)
    throw error
  }
}

/**
 * Check if a file exists in storage
 */
export async function fileExists(bucket: string, path: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      })

    return !error && data && data.length > 0
  } catch {
    return false
  }
}

/**
 * Delete a file and its thumbnail
 */
export async function deleteReceiptFiles(path: string): Promise<void> {
  const filesToDelete = [path]
  
  // Add thumbnail path if it might exist
  const thumbnailPath = `thumbnails/${path}`
  if (await fileExists('receipts', thumbnailPath)) {
    filesToDelete.push(thumbnailPath)
  }

  const { error } = await supabase.storage
    .from('receipts')
    .remove(filesToDelete)

  if (error) {
    throw new Error(`Failed to delete files: ${error.message}`)
  }

  // Clear from cache
  signedUrlCache.delete(`receipts:${path}:{}`)
  signedUrlCache.delete(`receipts:${thumbnailPath}:{}`)
}

/**
 * Get file metadata
 */
export async function getFileMetadata(bucket: string, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      })

    if (error || !data || data.length === 0) {
      throw new Error('File not found')
    }

    return data[0]
  } catch (error) {
    console.error('Error getting file metadata:', error)
    throw error
  }
}

/**
 * Clear all cached URLs (useful for logout/cleanup)
 */
export function clearSignedUrlCache(): void {
  signedUrlCache.clear()
}

// Export cache management functions
export const storageCache = {
  clear: clearSignedUrlCache,
  size: () => signedUrlCache.size,
  keys: () => Array.from(signedUrlCache.keys()),
  delete: (key: string) => signedUrlCache.delete(key)
}