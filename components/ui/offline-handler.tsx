'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { errorHandler } from '@/lib/error-handling'

interface OfflineHandlerProps {
  children: React.ReactNode
  showOfflineBanner?: boolean
  offlineComponent?: React.ReactNode
}

interface QueuedAction {
  id: string
  action: () => Promise<any>
  description: string
  timestamp: Date
}

export function OfflineHandler({
  children,
  showOfflineBanner = true,
  offlineComponent
}: OfflineHandlerProps) {
  const [isOnline, setIsOnline] = useState(errorHandler.isOnline())
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([])
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      processQueuedActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const processQueuedActions = async () => {
    if (queuedActions.length === 0) return

    setIsReconnecting(true)

    const results = await Promise.allSettled(
      queuedActions.map(action => action.action())
    )

    // Remove successful actions from queue
    const successfulIds = results
      .map((result, index) => result.status === 'fulfilled' ? queuedActions[index].id : null)
      .filter(Boolean)

    setQueuedActions(prev => prev.filter(action => !successfulIds.includes(action.id)))
    setIsReconnecting(false)
  }

  const queueAction = (action: () => Promise<any>, description: string) => {
    if (!isOnline) {
      const queuedAction: QueuedAction = {
        id: Date.now().toString(),
        action,
        description,
        timestamp: new Date()
      }

      setQueuedActions(prev => [...prev, queuedAction])
      return true // Indicate action was queued
    }

    return false // Action should be executed immediately
  }

  const retryConnection = () => {
    if (navigator.onLine) {
      setIsOnline(true)
      processQueuedActions()
    }
  }

  if (!isOnline && offlineComponent) {
    return <>{offlineComponent}</>
  }

  return (
    <>
      {children}

      {/* Offline Banner */}
      {showOfflineBanner && !isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You&apos;re offline. Some features may not be available.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {queuedActions.length > 0 && (
              <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                {queuedActions.length} action{queuedActions.length !== 1 ? 's' : ''} queued
              </span>
            )}

            <Button
              onClick={retryConnection}
              size="sm"
              variant="secondary"
              disabled={isReconnecting}
              className="text-yellow-900 bg-yellow-100 hover:bg-yellow-200"
            >
              {isReconnecting ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Queued Actions Modal */}
      {queuedActions.length > 0 && isOnline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Processing Queued Actions</h3>

              <div className="space-y-3 mb-6">
                {queuedActions.map(action => (
                  <div key={action.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{action.description}</p>
                      <p className="text-xs text-gray-500">
                        Queued {new Date(action.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setQueuedActions([])}
                  variant="outline"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Hook for using offline functionality
export function useOfflineHandler() {
  const [isOnline, setIsOnline] = useState(errorHandler.isOnline())

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const queueAction = (action: () => Promise<any>, description: string) => {
    if (!isOnline) {
      // Store in localStorage for persistence
      const queuedActions = JSON.parse(localStorage.getItem('queuedActions') || '[]')
      queuedActions.push({
        id: Date.now().toString(),
        action: action.toString(), // Note: This won't work for complex functions
        description,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('queuedActions', JSON.stringify(queuedActions))
      return true
    }
    return false
  }

  return {
    isOnline,
    queueAction,
    retryConnection: () => {
      if (navigator.onLine) {
        setIsOnline(true)
        // Process queued actions from localStorage
        const queuedActions = JSON.parse(localStorage.getItem('queuedActions') || '[]')
        // Note: In a real implementation, you'd need to reconstruct the actions
        localStorage.removeItem('queuedActions')
      }
    }
  }
}

// Network status indicator component
export function NetworkStatusIndicator({ className = '' }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(errorHandler.isOnline())
  const [connectionType, setConnectionType] = useState<string>('')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Get connection information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection.effectiveType || '')
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType || '')
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-600" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-600" />
      )}
      <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
        {isOnline ? 'Online' : 'Offline'}
        {connectionType && ` (${connectionType})`}
      </span>
    </div>
  )
}
