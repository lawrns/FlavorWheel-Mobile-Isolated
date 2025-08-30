'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface RealtimeContextType {
  isConnected: boolean
  subscribe: (channel: string, callback: (payload: any) => void) => () => void
  publish: (channel: string, payload: any) => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Record<string, ((payload: any) => void)[]>>({})

  useEffect(() => {
    // Simulate connection
    setTimeout(() => setIsConnected(true), 1000)

    return () => {
      setIsConnected(false)
    }
  }, [])

  const subscribe = (channel: string, callback: (payload: any) => void) => {
    setSubscriptions(prev => ({
      ...prev,
      [channel]: [...(prev[channel] || []), callback]
    }))

    // Return unsubscribe function
    return () => {
      setSubscriptions(prev => ({
        ...prev,
        [channel]: (prev[channel] || []).filter(cb => cb !== callback)
      }))
    }
  }

  const publish = (channel: string, payload: any) => {
    const channelSubscriptions = subscriptions[channel] || []
    channelSubscriptions.forEach(callback => {
      try {
        callback(payload)
      } catch (error) {
        console.error('Error in realtime subscription callback:', error)
      }
    })
  }

  const value: RealtimeContextType = {
    isConnected,
    subscribe,
    publish
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider')
  }
  return context
}
