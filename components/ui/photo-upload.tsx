'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { photoService, PhotoUploadResult, CameraPhotoResult } from '@/services/photo-service'
import { useToast } from '@/hooks/use-toast'

interface PhotoUploadProps {
  onPhotoUploaded?: (url: string) => void
  onPhotoRemoved?: () => void
  currentPhotoUrl?: string
  userId: string
  folder?: string
  disabled?: boolean
  maxPhotos?: number
  multiple?: boolean
  className?: string
}

interface PhotoState {
  preview: string
  file: File | null
  uploading: boolean
  uploaded: boolean
  error?: string
}

export function PhotoUpload({
  onPhotoUploaded,
  onPhotoRemoved,
  currentPhotoUrl,
  userId,
  folder = 'tastings',
  disabled = false,
  maxPhotos = 1,
  multiple = false,
  className = ''
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoState[]>(currentPhotoUrl ? [{
    preview: currentPhotoUrl,
    file: null,
    uploading: false,
    uploaded: true
  }] : [])

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Validate files
    for (const file of fileArray) {
      const validation = photoService.validateFile(file)
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: validation.error,
          variant: 'destructive'
        })
        return
      }
    }

    // Create photo states
    const newPhotos = fileArray.map(file => ({
      preview: photoService.createPreview(file),
      file,
      uploading: false,
      uploaded: false
    }))

    if (multiple) {
      setPhotos(prev => [...prev, ...newPhotos].slice(0, maxPhotos))
    } else {
      setPhotos(newPhotos)
    }
  }, [multiple, maxPhotos, toast])

  const handleCameraCapture = useCallback(async () => {
    try {
      setCameraActive(true)
      const result = await photoService.captureFromCamera()

      if (result) {
        const file = new File([result.blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        setPhotos([{
          preview: result.url,
          file,
          uploading: false,
          uploaded: false
        }])
        setCameraActive(false)
      }
    } catch (error) {
      console.error('Camera capture error:', error)
      toast({
        title: 'Camera error',
        description: 'Failed to access camera',
        variant: 'destructive'
      })
      setCameraActive(false)
    }
  }, [toast])

  const uploadPhoto = useCallback(async (photo: PhotoState, index: number) => {
    if (!photo.file || !userId) return

    setPhotos(prev => prev.map((p, i) =>
      i === index ? { ...p, uploading: true, error: undefined } : p
    ))

    const result = await photoService.uploadPhoto(photo.file, userId, folder)

    setPhotos(prev => prev.map((p, i) => {
      if (i === index) {
        if (result.success && result.url) {
          onPhotoUploaded?.(result.url)
          return {
            ...p,
            uploading: false,
            uploaded: true,
            error: undefined
          }
        } else {
          return {
            ...p,
            uploading: false,
            uploaded: false,
            error: result.error
          }
        }
      }
      return p
    }))

    if (result.success) {
      toast({
        title: 'Photo uploaded!',
        description: 'Your photo has been uploaded successfully.',
      })
    } else {
      toast({
        title: 'Upload failed',
        description: result.error || 'Failed to upload photo',
        variant: 'destructive'
      })
    }
  }, [userId, folder, onPhotoUploaded, toast])

  const removePhoto = useCallback((index: number) => {
    const photo = photos[index]
    if (photo.preview && !photo.uploaded) {
      photoService.revokePreview(photo.preview)
    }
    setPhotos(prev => prev.filter((_, i) => i !== index))
    onPhotoRemoved?.()
  }, [photos, onPhotoRemoved])

  const renderPhotoGrid = () => {
    if (photos.length === 0) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                disabled={disabled}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Camera</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload photos from your device or capture with camera
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <img
                  src={photo.preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-t-lg"
                />

                {/* Status overlay */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {photo.uploading && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border border-white"></div>
                      <span>Uploading</span>
                    </div>
                  )}
                  {photo.uploaded && (
                    <div className="bg-green-500 text-white p-1 rounded">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                  {photo.error && (
                    <div className="bg-red-500 text-white p-1 rounded">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 left-2"
                  disabled={photo.uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Error message */}
              {photo.error && (
                <div className="p-2 bg-red-50 border-t">
                  <p className="text-xs text-red-600">{photo.error}</p>
                </div>
              )}

              {/* Upload button */}
              {!photo.uploaded && !photo.uploading && (
                <div className="p-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => uploadPhoto(photo, index)}
                    className="w-full"
                  >
                    Upload Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add more photos button */}
        {multiple && photos.length < maxPhotos && (
          <Card className="border-dashed border-2">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[200px]">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-2"
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              <Button
                variant="outline"
                onClick={handleCameraCapture}
                disabled={disabled}
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {cameraActive ? (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md mx-auto rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex justify-center space-x-2">
            <Button onClick={() => setCameraActive(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        renderPhotoGrid()
      )}
    </div>
  )
}
