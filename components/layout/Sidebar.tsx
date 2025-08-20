'use client'

import { useState, useRef, useCallback } from 'react'
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
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
  badge?: string | number
  children?: NavigationItem[]
  shortcut?: string
  color?: string
  isNew?: boolean
  isPro?: boolean
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and insights',
    shortcut: '⌘1',
    color: 'text-brand-600'
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: FileText,
    description: 'All your notes',
    children: [
      { name: 'All Notes', href: '/notes', icon: FileText },
      { name: 'Create Note', href: '/notes/create', icon: Plus },
    ]
  },
  {
    name: 'Workspaces',
    href: '/workspaces',
    icon: Folder,
    description: 'Organize projects',
    children: [
      { name: 'All Workspaces', href: '/workspaces', icon: Folder },
      { name: 'Create Workspace', href: '/workspaces/create', icon: Plus },
    ]
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: Tag,
    description: 'Organize with tags',
    children: [
      { name: 'All Categories', href: '/categories', icon: Tag },
      { name: 'Auto Categories', href: '/categories?filter=auto', icon: Brain, isNew: true },
    ]
  },
  {
    name: 'AI Assistant',
    href: '/ai',
    icon: Sparkles,
    description: 'AI-powered features',
    badge: 'Pro',
    color: 'text-brand-600',
    children: [
      { name: 'AI Chat', href: '/ai/chat', icon: MessageSquare },
      { name: 'Summaries', href: '/summaries', icon: Brain },
      { name: 'Relations', href: '/relations', icon: Network },
      { name: 'Duplicates', href: '/duplicates', icon: Copy },
    ]
  },
  {
    name: 'Productivity',
    href: '/productivity',
    icon: Target,
    description: 'Tasks and time',
    children: [
      { name: 'Tasks', href: '/productivity/tasks', icon: CheckCircle },
      { name: 'Pomodoro', href: '/productivity/pomodoro', icon: Clock },
    ]
  },
  {
    name: 'Voice Notes',
    href: '/voice-notes',
    icon: Mic,
    description: 'Record and transcribe',
    isNew: true
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: Copy,
    description: 'Note templates',
  },
  {
    name: 'Mobile',
    href: '/mobile',
    icon: Smartphone,
    description: 'Mobile features',
  },
  {
    name: 'Search',
    href: '/search',
    icon: Search,
    description: 'Find anything',
    shortcut: '⌘K'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Usage insights',
    isPro: true
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Preferences',
    shortcut: '⌘,',
    color: 'text-text-muted'
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
}

export function Sidebar({ collapsed, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)

  const toggleExpanded = useCallback((href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }, [])

  const isActive = useCallback((href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }, [pathname])

  const isExpanded = useCallback((href: string) => {
    return expandedItems.includes(href)
  }, [expandedItems])

  // Modern navigation renderer with enhanced styling
  const renderNavItem = useCallback((item: NavigationItem, isSubItem = false) => {
    const active = isActive(item.href)
    const expanded = isExpanded(item.href)
    const hasChildren = item.children && item.children.length > 0

    if (collapsed && !isSubItem) {
      return (
        <div key={item.href} className="relative group">
          <Link
            href={item.href}
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-xl transition-modern mx-auto relative",
              "hover-lift",
              active
                ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-2 scale-105"
                : "hover:bg-surface-hover text-text-muted hover:text-brand-600"
            )}
            aria-label={item.name}
          >
            <item.icon className={cn("h-4 w-4", item.color)} aria-hidden="true" />
            
            {/* Active indicator */}
            {active && (
              <div className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 bg-brand-300 rounded-full animate-pulse" />
            )}
            
            {/* Badges */}
            {item.badge && (
              <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs rounded-full flex items-center justify-center px-1 shadow-1">
                {item.badge}
              </div>
            )}
            
            {item.isNew && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full" />
            )}
          </Link>

          {/* Modern tooltip */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 glass text-text text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-modern pointer-events-none z-50 whitespace-nowrap shadow-3 border border-border-subtle">
            <div className="font-medium">{item.name}</div>
            {item.description && (
              <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
            )}
            {item.shortcut && (
              <div className="flex items-center gap-1 text-xs mt-1">
                <kbd className="px-1 py-0.5 bg-bg-muted rounded text-xs font-mono">{item.shortcut}</kbd>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <li key={item.href} className={cn(isSubItem && "ml-4")}>
        <div
          className={cn(
            "flex items-center rounded-xl transition-modern group relative",
            isSubItem ? "px-3 py-2" : "px-3 py-2.5",
            active
              ? "bg-gradient-to-r from-brand-50 to-brand-100 text-brand-700 shadow-1 border border-brand-200"
              : "hover:bg-surface-hover text-text-secondary hover:text-text"
          )}
          onClick={() => {
            if (hasChildren && !isSubItem) {
              toggleExpanded(item.href)
            }
          }}
        >
          <Link href={item.href} className="flex items-center flex-1 min-w-0">
            <div className="flex-shrink-0 mr-3">
              <item.icon className={cn(
                "transition-modern", 
                isSubItem ? "h-4 w-4" : "h-4 w-4",
                active ? "text-brand-600" : item.color || ""
              )} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <span className={cn(
                "font-medium truncate block", 
                isSubItem ? "text-sm" : "text-sm",
                active ? "text-brand-700" : ""
              )}>
                {item.name}
              </span>
              {item.description && !active && !isSubItem && (
                <span className="text-xs text-text-subtle truncate block leading-tight">
                  {item.description}
                </span>
              )}
            </div>
          </Link>

          {/* Right side indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Feature badges */}
            {item.isNew && (
              <Badge variant="success" size="xs" className="px-1.5 py-0.5">
                New
              </Badge>
            )}
            
            {item.isPro && (
              <Badge variant="gradient" size="xs" className="px-1.5 py-0.5">
                Pro
              </Badge>
            )}
            
            {item.badge && !item.isNew && !item.isPro && (
              <Badge variant="feature" size="xs" className="px-1.5 py-0.5">
                {item.badge}
              </Badge>
            )}

            {item.shortcut && !isSubItem && (
              <kbd className="hidden group-hover:flex px-1.5 py-0.5 bg-bg-muted rounded text-xs font-mono items-center transition-modern border border-border-subtle">
                {item.shortcut}
              </kbd>
            )}

            {hasChildren && !isSubItem && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-60 hover:opacity-100 transition-modern"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(item.href)
                }}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.name} submenu`}
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform",
                    expanded ? "rotate-90" : ""
                  )}
                  aria-hidden="true"
                />
              </Button>
            )}

            {active && (
              <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Sub-navigation */}
        {hasChildren && expanded && !collapsed && (
          <ul className="mt-1 space-y-0.5 border-l border-border-subtle pl-3 ml-6">
            {item.children!.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-lg text-sm transition-modern group",
                    isActive(child.href)
                      ? "bg-brand-50 text-brand-600 font-medium"
                      : "hover:bg-surface-hover text-text-muted hover:text-text"
                  )}
                >
                  <child.icon className="h-3.5 w-3.5 mr-2 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate flex-1">{child.name}</span>
                  
                  {child.isNew && (
                    <div className="w-1.5 h-1.5 bg-success rounded-full ml-auto" />
                  )}
                  
                  {isActive(child.href) && (
                    <div className="w-1.5 h-1.5 bg-brand-600 rounded-full ml-auto" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }, [collapsed, isActive, isExpanded, toggleExpanded])

  return (
    <div
      ref={sidebarRef}
      className="h-full bg-surface border-r border-border flex flex-col shadow-2 relative overflow-hidden"
    >
      {/* Modern background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-elevated to-surface pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group transition-modern hover-lift"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="relative p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl group-hover:from-brand-200 group-hover:to-brand-300 transition-modern shadow-1">
                <Sparkles className="h-5 w-5 text-brand-600" aria-hidden="true" />
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
        </div>

        {/* Quick actions for collapsed state */}
        {collapsed && (
          <div className="mt-4 space-y-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="w-full h-8 rounded-xl transition-modern hover-lift hover:bg-surface-hover"
              aria-label="Create new note"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto p-4" role="navigation" aria-label="Main navigation">
        <ul className="space-y-1">
          {navigation.map((item) => renderNavItem(item))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="relative z-10 p-4 border-t border-border bg-gradient-to-r from-brand-50/50 via-transparent to-brand-50/30">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-muted font-medium">
              AI Notes v1.0
            </div>
            <Badge 
              variant="feature" 
              size="xs"
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
    </div>
  )
}
