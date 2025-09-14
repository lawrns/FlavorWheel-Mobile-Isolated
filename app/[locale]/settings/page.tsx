'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Trash2,
  Save,
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    tastingReminders: boolean
    socialActivity: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    showActivity: boolean
    allowFriendRequests: boolean
  }
  preferences: {
    defaultTastingMode: 'quick' | 'study' | 'competition'
    autoSave: boolean
    hapticFeedback: boolean
  }
}

export default function SettingsPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const { user, client: supabase } = useSupabase()
  const { toast } = useToast()

  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      tastingReminders: true,
      socialActivity: true,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'public',
      showActivity: true,
      allowFriendRequests: true
    },
    preferences: {
      defaultTastingMode: 'quick',
      autoSave: true,
      hapticFeedback: true
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data?.preferences) {
        setSettings(prev => ({
          ...prev,
          ...data.preferences
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Settings saved!',
        description: 'Your preferences have been updated successfully.',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [key]: value
      }
    }))
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      })
      router.push(`/${locale}/landing`)
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      // Delete user data (this would need to be handled carefully in production)
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      })
      router.push(`/${locale}/landing`)
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-card">
            <h2 className="text-xl font-semibold mb-4">Sign in required</h2>
            <p className="text-card-text-secondary mb-6">
              Please sign in to access settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="settings">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </DashboardAppShell>
    )
  }

  return (
    <DashboardAppShell activeNavItem="settings">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-card-text-secondary mt-1">
                  Customize your FlavorWheel experience
                </p>
              </div>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Theme</Label>
                    <p className="text-sm text-card-text-secondary">
                      Choose your preferred theme
                    </p>
                  </div>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value as UserSettings['theme'] }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Monitor className="h-4 w-4 mr-2" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <p className="text-sm text-card-text-secondary">
                      Select your preferred language
                    </p>
                  </div>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-card-text-secondary">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-card-text-secondary">
                      Get notified on your device
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tasting Reminders</Label>
                    <p className="text-sm text-card-text-secondary">
                      Remind me to log tastings
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.tastingReminders}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'tastingReminders', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Social Activity</Label>
                    <p className="text-sm text-card-text-secondary">
                      Notifications about friends&apos; activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.socialActivity}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'socialActivity', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-card-text-secondary">
                      Weekly summary of your activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyDigest}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyDigest', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-card-text-secondary">
                      Who can see your profile
                    </p>
                  </div>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Activity</Label>
                    <p className="text-sm text-card-text-secondary">
                      Display your tasting activity to others
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showActivity}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'showActivity', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Friend Requests</Label>
                    <p className="text-sm text-card-text-secondary">
                      Let others send you friend requests
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowFriendRequests}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'allowFriendRequests', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Default Tasting Mode</Label>
                    <p className="text-sm text-card-text-secondary">
                      Preferred tasting interface
                    </p>
                  </div>
                  <Select
                    value={settings.preferences.defaultTastingMode}
                    onValueChange={(value) => handleSettingChange('preferences', 'defaultTastingMode', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-save Drafts</Label>
                    <p className="text-sm text-card-text-secondary">
                      Automatically save your work
                    </p>
                  </div>
                  <Switch
                    checked={settings.preferences.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('preferences', 'autoSave', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Haptic Feedback</Label>
                    <p className="text-sm text-card-text-secondary">
                      Enable vibration feedback
                    </p>
                  </div>
                  <Switch
                    checked={settings.preferences.hapticFeedback}
                    onCheckedChange={(checked) => handleSettingChange('preferences', 'hapticFeedback', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-fx-ai-confidence-low/50">
              <CardHeader>
                <CardTitle className="flex items-center text-fx-ai-confidence-low">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-fx-ai-confidence-low">Sign Out</Label>
                    <p className="text-sm text-card-text-secondary">
                      Sign out of your account
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="border-fx-ai-confidence-low/50 text-fx-ai-confidence-low hover:bg-fx-ai-confidence-low/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-fx-ai-confidence-low">Delete Account</Label>
                    <p className="text-sm text-card-text-secondary">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-fx-ai-confidence-low">Delete Account</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </AlertDescription>
                        </Alert>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                          >
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardAppShell>
  )
}

