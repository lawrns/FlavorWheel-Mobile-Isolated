import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { handleUploadError } from '@/lib/error-handling'

export interface PhotoUploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export interface PhotoUploadResult {
  success: boolean
  url?: string
  error?: string
  filePath?: string
}

export interface CameraPhotoResult {
  blob: Blob
  url: string
}

export class PhotoService {
  private supabase = supabase

  /**
   * Compress and resize an image file
   */
  async compressImage(
    file: File,
    options: PhotoUploadOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          `image/${format}`,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Upload a photo to Supabase storage
   */
  async uploadPhoto(
    file: File | Blob,
    userId: string,
    folder: string = 'tastings',
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult> {
    try {
      // Validate user ID
      if (!userId || userId.trim() === '') {
        console.error('PhotoService: No user ID provided')
        return {
          success: false,
          error: 'User not authenticated'
        }
      }

      // Check if user is authenticated
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        console.error('PhotoService: User authentication error:', authError)
        return {
          success: false,
          error: 'User not authenticated'
        }
      }

      // Verify user ID matches authenticated user
      if (user.id !== userId) {
        console.error('PhotoService: User ID mismatch', { expected: user.id, received: userId })
        return {
          success: false,
          error: 'Authentication mismatch'
        }
      }

      // Compress image if it's a File
      let uploadFile: File | Blob = file
      if (file instanceof File) {
        uploadFile = await this.compressImage(file, options)
      }

      // Generate unique filename with user ID as first folder level for RLS policy
      const fileName = `${uuidv4()}.jpg`
      const filePath = `${userId}/${folder}/${fileName}`

      // Upload to Supabase
      console.log('PhotoService: Attempting upload with path:', filePath, 'userId:', userId)
      const { error: uploadError } = await this.supabase.storage
        .from('tasting-photos')
        .upload(filePath, uploadFile as any, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        await handleUploadError(uploadError, {
          userId,
          folder,
          fileName: filePath
        })
        return {
          success: false,
          error: uploadError.message
        }
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('tasting-photos')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        return {
          success: false,
          error: 'Failed to get public URL'
        }
      }

      return {
        success: true,
        url: urlData.publicUrl,
        filePath
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      await handleUploadError(error, {
        userId,
        folder,
        operation: 'uploadPhoto'
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete a photo from storage
   */
  async deletePhoto(filePath: string): Promise<boolean> {
    try {
      // filePath should already include userId/folder/filename format
      const { error } = await this.supabase.storage
        .from('tasting-photos')
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Photo delete error:', error)
      return false
    }
  }

  /**
   * Access camera and capture photo
   */
  async captureFromCamera(): Promise<CameraPhotoResult | null> {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported')
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      // Create video element to capture from
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Wait for video to load
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      // Create canvas to capture frame
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      ctx?.drawImage(video, 0, 0)

      // Stop camera stream
      stream.getTracks().forEach(track => track.stop())

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else throw new Error('Failed to create blob')
        }, 'image/jpeg', 0.8)
      )

      const url = URL.createObjectURL(blob)

      return { blob, url }
    } catch (error) {
      console.error('Camera capture error:', error)
      return null
    }
  }

  /**
   * Upload multiple photos
   */
  async uploadMultiplePhotos(
    files: FileList | File[],
    userId: string,
    folder: string = 'tastings',
    onProgress?: (completed: number, total: number) => void
  ): Promise<PhotoUploadResult[]> {
    const fileArray = Array.from(files)
    const results: PhotoUploadResult[] = []

    for (let i = 0; i < fileArray.length; i++) {
      const result = await this.uploadPhoto(fileArray[i], userId, folder)
      results.push(result)

      if (onProgress) {
        onProgress(i + 1, fileArray.length)
      }
    }

    return results
  }

  /**
   * Get photo metadata
   */
  async getPhotoMetadata(filePath: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from('tasting-photos')
        .list('', {
          search: filePath
        })

      if (error) throw error

      return (data && 'files' in data && Array.isArray(data.files) && data.files.length > 0) ? data.files[0] : null
    } catch (error) {
      console.error('Get metadata error:', error)
      return null
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      }
    }

    return { valid: true }
  }

  /**
   * Create a photo preview URL
   */
  createPreview(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Clean up preview URL
   */
  revokePreview(url: string): void {
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const photoService = new PhotoService()

