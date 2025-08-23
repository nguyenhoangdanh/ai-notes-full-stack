'use client'

import { useState, useRef, useCallback, useMemo, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MessageSquare,
  Settings,
  Copy,
  Folder,
  Search,
  Plus,
  Clock,
  Calendar,
  CheckCircle,
  Mic,
  MapPin,
  FileText,
  BarChart3,
  Sparkles,
  ChevronRight,
  Terminal,
  Users,
  CloudUpload,
  Upload,
  Tag,
  Smartphone,
  Network,
  Brain,
  Hash,
  Zap,
  Target
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { SidebarNav, createMainNavGroup, createAINavGroup, createAccountNavGroup } from '../ui/SidebarNav'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
}

export function Sidebar({ collapsed, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  // Determine active section based on pathname
  const getActiveId = () => {
    if (pathname.startsWith('/dashboard')) return 'dashboard'
    if (pathname.startsWith('/notes')) return 'notes'
    if (pathname.startsWith('/workspaces')) return 'workspaces'
    if (pathname.startsWith('/categories')) return 'categories'
    if (pathname.startsWith('/ai')) return 'ai-chat'
    if (pathname.startsWith('/summaries')) return 'summaries'
    if (pathname.startsWith('/relations')) return 'relations'
    if (pathname.startsWith('/duplicates')) return 'duplicates'
    if (pathname.startsWith('/analytics')) return 'analytics'
    if (pathname.startsWith('/productivity')) return 'productivity'
    if (pathname.startsWith('/settings')) return 'settings'
    return 'dashboard'
  }

  const activeId = getActiveId()

  // Create navigation groups
  const navGroups = [
    createMainNavGroup(activeId),
    createAINavGroup(activeId),
    createAccountNavGroup(activeId)
  ]

  return (
    <div className="h-full panel border-r border-border flex flex-col shadow-2 relative overflow-hidden">
      {/* Modern background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-panel via-panel-2 to-panel pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-border-soft">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group transition-modern hover-lift"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="relative p-2 glass rounded-xl group-hover:shadow-glow transition-modern">
                <Sparkles className="h-5 w-5 text-primary-600" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none text-gradient">
                  AI Notes
                </span>
                <span className="text-xs text-text-muted font-medium">
                  Smart workspace
                </span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center group transition-modern hover-lift mx-auto"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="relative p-2 glass rounded-xl group-hover:shadow-glow transition-modern">
                <Sparkles className="h-5 w-5 text-primary-600" aria-hidden="true" />
              </div>
            </Link>
          )}
        </div>

        {/* Quick actions for collapsed state */}
        {collapsed && (
          <div className="mt-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              className="w-full h-8 rounded-xl transition-modern hover-lift hover:bg-bg-elev-1"
              aria-label="Create new note"
              onClick={() => window.location.href = '/notes/create'}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto p-4" role="navigation" aria-label="Main navigation">
        <SidebarNav 
          groups={navGroups}
          compact={collapsed}
          className="space-y-6"
        />
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="relative z-10 p-4 border-t border-border-soft bg-gradient-to-r from-primary-600/5 via-transparent to-purple/5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-muted font-medium">
              AI Notes v1.0
            </div>
            <Badge 
              variant="ai" 
              size="sm"
              className="px-2 py-1"
            >
              Beta
            </Badge>
          </div>
          
          {/* Keyboard hint */}
          <div className="mt-2 text-xs text-text-subtle flex items-center gap-1">
            <Terminal className="h-3 w-3" />
            <span>Press ⌘\ to toggle</span>
          </div>
        </div>
      )}

      {/* Collapsed footer */}
      {collapsed && (
        <div className="relative z-10 p-4 border-t border-border-soft">
          <div className="flex justify-center">
            <Badge 
              variant="ai" 
              size="sm"
              className="px-1.5 py-1 text-xs"
            >
              β
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
