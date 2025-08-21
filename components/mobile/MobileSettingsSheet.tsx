'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/progress'
import { 
  ArrowLeft, 
  User, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash,
  Shield,
  Database,
  Wifi,
  WifiOff,
  Cloud,
  HardDrive,
  Info,
  ExternalLink
} from 'lucide-react'
import { useOfflineNotes } from '../../contexts/OfflineNotesContext'
import { offlineStorage, AppSettings } from '../../lib/offline-storage'
import { useAuthProfile as useProfile, useUserSettings as useSettings, useUpdateSettings } from '../../hooks'
import { toast } from 'sonner'

interface MobileSettingsSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSettingsSheet({ isOpen, onClose }: MobileSettingsSheetProps) {
  const { 
    syncStatus, 
    forceSync, 
    exportNotes, 
    importNotes 
  } = useOfflineNotes()
  
  const { data: user } = useProfile()
  const { data: settings } = useSettings()
  const updateSettingsMutation = useUpdateSettings()
  const [storageUsage, setStorageUsage] = useState({ notes: 0, attachments: 0, total: 0 })
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadStorageUsage()
    }
  }, [isOpen])

  const loadStorageUsage = async () => {
    try {
      const usage = await offlineStorage.getStorageUsage()
      setStorageUsage(usage)
    } catch (error) {
      console.error('Failed to load storage usage:', error)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    if (!settings) return

    try {
      const updatedSettings = {
        [key]: value
      }
      
      await updateSettingsMutation.mutateAsync(updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to update settings')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportNotes()
      
      // Create and download file
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-notes-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Notes exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        await importNotes(text)
      } catch (error) {
        console.error('Import failed:', error)
        toast.error('Import failed')
      }
    }
    input.click()
  }

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      try {
        await offlineStorage.clearAllData()
        toast.success('All data cleared')
        window.location.reload()
      } catch (error) {
        console.error('Failed to clear data:', error)
        toast.error('Failed to clear data')
      }
    }
  }

  const getStoragePercentage = () => {
    const maxStorage = 50 // Assume 50MB limit for demo
    return Math.min((storageUsage.total / maxStorage) * 100, 100)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* User Profile */}
          {user && (
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">{user.name || user.email}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{storageUsage.notes}</p>
                  <p className="text-xs text-muted-foreground">Notes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{storageUsage.attachments}</p>
                  <p className="text-xs text-muted-foreground">Attachments</p>
                </div>
              </div>
            </Card>
          )}

          {/* Sync Status */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {syncStatus.isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <h3 className="font-medium">Sync Status</h3>
                <p className="text-sm text-muted-foreground">
                  {syncStatus.isOnline ? 'Connected' : 'Offline'}
                </p>
              </div>
            </div>
            
            {syncStatus.pendingOperations > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Pending sync</span>
                  <span>{syncStatus.pendingOperations} items</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            )}
            
            {syncStatus.lastSyncTime && (
              <p className="text-xs text-muted-foreground mb-3">
                Last sync: {new Date(syncStatus.lastSyncTime).toLocaleString()}
              </p>
            )}
            
            <Button
              onClick={forceSync}
              disabled={syncStatus.isSyncing || !syncStatus.isOnline}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </Card>

          {/* App Settings */}
          {settings && (
            <Card className="p-4">
              <h3 className="font-medium mb-4">AI Settings</h3>
              
              <div className="space-y-4">
                {/* Model Selection */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5" />
                    <div>
                      <p className="font-medium">AI Model</p>
                      <p className="text-sm text-muted-foreground">Current: {settings?.model}</p>
                    </div>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Max Tokens</p>
                      <p className="text-sm text-muted-foreground">Current: {settings?.maxTokens}</p>
                    </div>
                  </div>
                </div>

                {/* Auto Re-embed */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Auto Re-embed</p>
                      <p className="text-sm text-muted-foreground">Auto process notes for search</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings?.autoReembed || false}
                    onCheckedChange={(checked) => updateSetting('autoReembed', checked)}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Storage Management */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="h-5 w-5" />
              <h3 className="font-medium">Storage</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Local Storage Used</span>
                  <span>{getStoragePercentage().toFixed(1)}%</span>
                </div>
                <Progress value={getStoragePercentage()} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">{storageUsage.notes}</p>
                  <p className="text-muted-foreground">Notes</p>
                </div>
                <div>
                  <p className="font-medium">{storageUsage.attachments}</p>
                  <p className="text-muted-foreground">Attachments</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Data Management</h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-3" />
                {isExporting ? 'Exporting...' : 'Export Notes'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleImport}
                className="w-full justify-start"
              >
                <Upload className="h-4 w-4 mr-3" />
                Import Notes
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleClearData}
                className="w-full justify-start"
              >
                <Trash className="h-4 w-4 mr-3" />
                Clear All Data
              </Button>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5" />
              <h3 className="font-medium">Privacy & Security</h3>
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• All notes are encrypted locally</p>
              <p>• Sync data is encrypted in transit</p>
              <p>• No third-party analytics tracking</p>
              <p>• Open source and transparent</p>
            </div>
          </Card>

          {/* About */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-5 w-5" />
              <h3 className="font-medium">About</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Version</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Build</span>
                <Badge variant="outline">PWA</Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
