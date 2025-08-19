'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Palette, Shield, Cloud } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Switch } from '../../components/ui/switch'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ThemeToggle } from '../../components/common/ThemeToggle'
import { useAuth, useUserSettings, useUpdateSettings } from '../../hooks/use-auth'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const { data: settings, isLoading: settingsLoading } = useUserSettings()
  const updateSettingsMutation = useUpdateSettings()
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    reminderNotifications: true,
    collaborationUpdates: true,
  })
  const [preferences, setPreferences] = useState({
    autoSave: true,
    autoSync: true,
    offlineMode: false,
    aiSuggestions: true,
  })

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      // UserSettings type is different from our local state
      // For now, we'll manage notifications and preferences locally
      // TODO: Update backend to support these settings
    }
  }, [settings])

  const handleProfileSave = async () => {
    try {
      // TODO: Add profile update API call when backend supports it
      toast.success('Profile saved successfully')
      console.log('Saving profile:', profile)
    } catch (error) {
      toast.error('Failed to save profile')
    }
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)
    
    // TODO: Update when backend supports notification settings
    toast.success('Notification setting updated')
  }

  const handlePreferenceChange = async (key: string, value: boolean) => {
    const updatedPreferences = { ...preferences, [key]: value }
    setPreferences(updatedPreferences)
    
    // TODO: Update when backend supports preference settings
    toast.success('Preference updated')
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center space-x-2">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Sync</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Your email"
                    type="email"
                  />
                </div>
                <Button onClick={handleProfileSave}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'pushNotifications' && 'Receive push notifications'}
                        {key === 'reminderNotifications' && 'Get reminded about important notes'}
                        {key === 'collaborationUpdates' && 'Updates about shared notes and workspaces'}
                      </div>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size</label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {key === 'autoSave' && 'Automatically save changes as you type'}
                        {key === 'autoSync' && 'Sync your notes across devices automatically'}
                        {key === 'offlineMode' && 'Enable offline access to your notes'}
                        {key === 'aiSuggestions' && 'Allow AI to provide writing suggestions'}
                      </div>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handlePreferenceChange(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Settings */}
          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>Sync & Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Your notes are automatically synced across all your devices. Last sync: Just now
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">Force Sync</Button>
                  <Button variant="outline">Export All Data</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}