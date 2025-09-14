'use client'

import { useEffect, useState } from 'react'
import { registerServiceWorker, isServiceWorkerSupported, onNetworkChange } from '@/lib/service-worker'

interface ServiceWorkerProviderProps {
  children: React.ReactNode
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Register service worker
    if (isServiceWorkerSupported()) {
      registerServiceWorker()
    }

    // Listen for network changes
    const cleanup = onNetworkChange((online) => {
      setIsOnline(online)
    })

    // Listen for service worker updates
    const handleUpdate = () => {
      setUpdateAvailable(true)
    }

    window.addEventListener('sw-update-available', handleUpdate)

    return () => {
      cleanup()
      window.removeEventListener('sw-update-available', handleUpdate)
    }
  }, [])

  return (
    <>
      {children}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 bg-warning text-white px-4 py-2 rounded-lg shadow-card">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Offline Mode</span>
          </div>
          <p className="text-xs mt-1">Some features may be limited</p>
        </div>
      )}

      {/* Update available indicator */}
      {updateAvailable && (
        <div className="fixed top-4 right-4 z-50 bg-info text-white px-4 py-2 rounded-lg shadow-card">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Update Available</span>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-blue-500 px-2 py-1 rounded text-xs font-medium hover:bg-blue-50"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </>
  )
}
