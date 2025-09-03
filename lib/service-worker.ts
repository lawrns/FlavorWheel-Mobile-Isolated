// Service Worker registration and management utilities
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  async register(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported')
      return
    }

    try {
      console.log('Registering Service Worker...')
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered successfully:', this.registration.scope)

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              this.notifyUpdateAvailable()
            }
          })
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event)
      })

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event that components can listen to
    const event = new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    })
    window.dispatchEvent(event)
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data)
        break
      case 'OFFLINE_READY':
        console.log('App ready for offline use')
        break
      case 'SYNC_COMPLETED':
        console.log('Background sync completed')
        break
      default:
        console.log('Unknown message from SW:', type, data)
    }
  }

  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update()
    }
  }

  async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister()
      this.registration = null
    }
  }

  isRegistered(): boolean {
    return this.registration !== null
  }

  async requestSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.registration?.sync.register(tag)
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  // Check if app is online
  isOnline(): boolean {
    return navigator.onLine
  }

  // Listen for online/offline events
  onNetworkChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

// Export singleton instance
export const swManager = ServiceWorkerManager.getInstance()

// Helper functions for components
export const registerServiceWorker = () => swManager.register()
export const isServiceWorkerSupported = () => 'serviceWorker' in navigator
export const isOnline = () => swManager.isOnline()
export const onNetworkChange = (callback: (online: boolean) => void) => swManager.onNetworkChange(callback)
