'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw, X } from 'lucide-react'
import { FaApple, FaGoogle } from 'react-icons/fa'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { ClientOnly } from '@/components/client-only'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { login, signup, isLoading } = useAuth()
  const { toast } = useToast()

  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(signInEmail, signInPassword)
      toast({
        title: 'Welcome!',
        description: 'You have successfully signed in',
      })
      onClose()
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as { message?: string })?.message || 'Failed to sign in',
        variant: 'destructive',
      })
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signUpPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }
    try {
      const result = await signup(signUpName, signUpEmail, signUpPassword)

      if (result?.success) {
        if (result.needsConfirmation) {
          // Email confirmation required
          toast({
            title: 'Account created!',
            description: 'Please check your email to confirm your account, then sign in.',
          })
        } else {
          // User is automatically signed in
          toast({
            title: 'Welcome!',
            description: 'Your account has been created successfully!',
          })
          onClose()
        }
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as { message?: string })?.message || 'Failed to create account',
        variant: 'destructive',
      })
    }
  }

  const handleDemoLogin = async () => {
    try {
      await login('demo@flavorwheel.mx', 'demo123456')
      toast({
        title: 'Welcome!',
        description: 'Signed in with demo account',
      })
      onClose()
    } catch (error: unknown) {
      console.error('Demo login error:', error)
      toast({
        title: 'Demo account unavailable',
        description: 'Please create a new account or try again later.',
        variant: 'destructive',
      })
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <ClientOnly>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleOverlayClick}
        >
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            FlavorWheel México
          </CardTitle>
          <p className="text-gray-600">Mexican Beverage Tasting Platform</p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Your password"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* External Authentication Options */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                  onClick={() => {
                    // Google OAuth integration will be implemented here
                    toast({
                      title: 'Google Sign In',
                      description: 'Google authentication will be available soon.',
                    })
                  }}
                  disabled={isLoading}
                >
                  <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-black hover:bg-gray-800 text-white border-gray-800"
                  onClick={() => {
                    // Apple OAuth integration will be implemented here
                    toast({
                      title: 'Apple Sign In',
                      description: 'Apple authentication will be available soon.',
                    })
                  }}
                  disabled={isLoading}
                >
                  <FaApple className="mr-2 h-4 w-4" />
                  Continue with Apple
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={signUpName}
                    onChange={e => setSignUpName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={signUpPassword}
                    onChange={e => setSignUpPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
        </div>
      )}
    </ClientOnly>
  )
}