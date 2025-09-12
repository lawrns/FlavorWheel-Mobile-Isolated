'use client'

import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { User, LogOut } from 'lucide-react'

export function TestUserButton() {
  const { user, loginAsTestUser, logout, isAuthenticated } = useAuth()
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-2 shadow-lg">
      <div className="text-xs text-yellow-800 mb-2 font-semibold">DEV MODE</div>
      {isAuthenticated ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">
            Logged in as: {user?.name}
          </div>
          <Button
            onClick={logout}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        </div>
      ) : (
        <Button
          onClick={loginAsTestUser}
          size="sm"
          className="w-full text-xs bg-yellow-500 hover:bg-yellow-600"
        >
          <User className="h-3 w-3 mr-1" />
          Login as Test User
        </Button>
      )}
    </div>
  )
}
