'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Users, 
  Shield, 
  Trash2, 
  Save,
  Upload,
  Palette,
  Globe,
  Lock,
  Crown,
  UserPlus,
  Link,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { QuickTooltip } from '../ui/tooltip'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../ui/alert-dialog'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { useWorkspaces } from '../../hooks/use-workspaces'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface WorkspaceSettingsPanelProps {
  workspaceId: string
  onClose?: () => void
  className?: string
}

export function WorkspaceSettingsPanel({ 
  workspaceId, 
  onClose,
  className 
}: WorkspaceSettingsPanelProps) {
  const { data: workspaces } = useWorkspaces()
  
  // Find the specific workspace from the list
  const workspace = workspaces?.find(w => w.id === workspaceId)
  
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    privacy: workspace?.privacy || 'private',
    allowInvites: workspace?.allowInvites || false,
    autoBackup: workspace?.autoBackup || true,
    aiFeatures: workspace?.aiFeatures || true,
    theme: workspace?.theme || 'system'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'security' | 'advanced'>('general')

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Workspace settings updated successfully')
    } catch (error) {
      toast.error('Failed to update workspace settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    toast.error('Workspace deletion is not supported yet')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: AlertTriangle }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl">
            <Settings className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Workspace Settings</h2>
            <p className="text-text-muted">Manage your workspace configuration</p>
          </div>
        </div>
        <Badge variant="feature" className="gap-2">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <Card variant="glass" className="shadow-2 border border-border-subtle">
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "gap-2 rounded-xl transition-modern",
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-2" 
                      : "hover:bg-brand-50 hover:text-brand-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card variant="elevated" className="shadow-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-brand-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>Configure your workspace identity and appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name" className="text-text-secondary font-medium">
                    Workspace Name
                  </Label>
                  <Input
                    id="workspace-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workspace name"
                    className="h-12 rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workspace-description" className="text-text-secondary font-medium">
                    Description <span className="text-text-subtle">(Optional)</span>
                  </Label>
                  <Textarea
                    id="workspace-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this workspace..."
                    className="rounded-xl min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-privacy" className="text-text-secondary font-medium">
                      Privacy Setting
                    </Label>
                    <Select 
                      value={formData.privacy} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, privacy: value }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-text-muted" />
                            <div>
                              <p className="font-medium">Private</p>
                              <p className="text-sm text-text-muted">Only you can access</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="shared">
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-text-muted" />
                            <div>
                              <p className="font-medium">Team</p>
                              <p className="text-sm text-text-muted">Shared with team members</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-text-muted" />
                            <div>
                              <p className="font-medium">Public</p>
                              <p className="text-sm text-text-muted">Anyone can view</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workspace-theme" className="text-text-secondary font-medium">
                      Theme Preference
                    </Label>
                    <Select 
                      value={formData.theme} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="light">Light Theme</SelectItem>
                        <SelectItem value="dark">Dark Theme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Toggles */}
            <Card variant="elevated" className="shadow-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-brand-600" />
                  Features & Preferences
                </CardTitle>
                <CardDescription>Enable or disable workspace features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-text font-medium">AI Features</Label>
                      <p className="text-sm text-text-muted">
                        Enable AI-powered suggestions and analysis
                      </p>
                    </div>
                    <Switch
                      checked={formData.aiFeatures}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, aiFeatures: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-text font-medium">Auto Backup</Label>
                      <p className="text-sm text-text-muted">
                        Automatically backup workspace data
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoBackup}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, autoBackup: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-text font-medium">Allow Invitations</Label>
                      <p className="text-sm text-text-muted">
                        Let team members invite others to this workspace
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowInvites}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, allowInvites: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card variant="elevated" className="shadow-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-brand-600" />
                      Team Members
                    </CardTitle>
                    <CardDescription>Manage workspace access and permissions</CardDescription>
                  </div>
                  <Button variant="gradient" className="gap-2 shadow-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current user */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-50 to-surface rounded-2xl border border-brand-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white font-semibold">
                        Y
                      </div>
                      <div>
                        <p className="font-semibold text-text">You</p>
                        <p className="text-sm text-text-muted">Workspace Owner</p>
                      </div>
                    </div>
                    <Badge variant="gradient" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  </div>

                  <Separator />

                  {/* Invitation placeholder */}
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center">
                      <Users className="h-8 w-8 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text mb-2">No Team Members Yet</h3>
                      <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                        Collaboration features are coming soon. You'll be able to invite team members and manage permissions.
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2 mt-4">
                      <Link className="h-4 w-4" />
                      Generate Invite Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card variant="elevated" className="shadow-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-600" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and privacy options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card variant="outline" className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <h4 className="font-semibold">Encryption</h4>
                      </div>
                      <p className="text-sm text-text-muted">
                        All data is encrypted at rest and in transit using AES-256 encryption.
                      </p>
                    </div>
                  </Card>

                  <Card variant="outline" className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <h4 className="font-semibold">Backups</h4>
                      </div>
                      <p className="text-sm text-text-muted">
                        Daily automated backups with 30-day retention policy.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-text mb-1">Security Notice</h4>
                      <p className="text-sm text-text-muted leading-relaxed">
                        Advanced security features including 2FA, audit logs, and compliance certifications 
                        will be available in the Pro version coming soon.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card variant="elevated" className="shadow-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-brand-600" />
                  Data Management
                </CardTitle>
                <CardDescription>Import, export, and manage your workspace data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="gap-2 h-12 rounded-xl">
                    <Upload className="h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="gap-2 h-12 rounded-xl">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                </div>

                <div className="p-4 bg-gradient-to-r from-brand-50 to-surface border border-brand-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-brand-600" />
                    <h4 className="font-semibold text-text">Backup Status</h4>
                  </div>
                  <p className="text-sm text-text-muted mb-3">
                    Last backup: Today at 3:24 AM
                  </p>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Backup History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card variant="outlined" className="border-danger/20 shadow-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions for this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-danger/5 border border-danger/20 rounded-2xl">
                    <h4 className="font-semibold text-danger mb-2">Delete Workspace</h4>
                    <p className="text-sm text-text-muted mb-4">
                      This action cannot be undone. All notes, settings, and data in this workspace will be permanently deleted.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Workspace
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. All notes in this workspace will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
        <Button variant="outline" onClick={onClose} className="gap-2 rounded-xl">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading} 
          loading={isLoading}
          variant="gradient"
          className="gap-2 rounded-xl shadow-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </motion.div>
  )
}
