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
  Plus,
  FileText,
  BarChart3,
  Sparkles,
  Terminal,
  Network,
  Hash,
  FolderOpen,
  Tag,
  Timer,
  FileBarChart
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button, IconButton } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  user?: any
}

// Navigation item type definition
interface NavItem {
  id: string
  label: string
  icon: any
  href: string
  description: string
  badge?: {
    text: string
    variant: 'default' | 'ai' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'secondary'
  }
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

// Navigation items configuration
const NAVIGATION_ITEMS: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/dashboard',
        description: 'Overview and quick actions'
      },
      {
        id: 'notes',
        label: 'Notes',
        icon: FileText,
        href: '/notes',
        description: 'All your notes'
      },
      {
        id: 'workspaces',
        label: 'Workspaces',
        icon: FolderOpen,
        href: '/workspaces',
        description: 'Organize your content'
      },
      {
        id: 'categories',
        label: 'Categories',
        icon: Tag,
        href: '/categories',
        description: 'Content categorization'
      }
    ]
  },
  {
    id: 'ai',
    label: 'AI Features',
    items: [
      {
        id: 'ai-chat',
        label: 'AI Assistant',
        icon: MessageSquare,
        href: '/ai/chat',
        description: 'Chat with AI assistant',
        badge: { text: 'AI', variant: 'ai' }
      },
      {
        id: 'summaries',
        label: 'Summaries',
        icon: FileBarChart,
        href: '/summaries',
        description: 'AI-generated summaries'
      },
      {
        id: 'relations',
        label: 'Relations',
        icon: Network,
        href: '/relations',
        description: 'Content relationships'
      },
      {
        id: 'duplicates',
        label: 'Duplicates',
        icon: Copy,
        href: '/duplicates',
        description: 'Find duplicate content'
      }
    ]
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/analytics',
        description: 'Usage insights'
      },
      {
        id: 'productivity',
        label: 'Productivity',
        icon: Timer,
        href: '/productivity',
        description: 'Productivity tools'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        description: 'App preferences'
      }
    ]
  }
]

// Memoized navigation item component
const NavItem = memo(function NavItem({
  item,
  isActive,
  collapsed,
  onClick
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}) {
  const itemClasses = useMemo(() => cn(
    "group relative flex items-center w-full rounded-xl transition-all duration-200 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-accent-6/20 focus:ring-offset-2 focus:ring-offset-bg",
    collapsed ? "p-3 justify-center" : "px-3 py-2.5 gap-3",
    isActive 
      ? "bg-accent-3 text-accent-11 shadow-sm border border-accent-6/20" 
      : "text-neutral-11 hover:bg-neutral-3 hover:text-accent-11 active:bg-neutral-4"
  ), [isActive, collapsed])

  const iconClasses = useMemo(() => cn(
    "flex-shrink-0 transition-colors duration-200",
    collapsed ? "w-5 h-5" : "w-5 h-5",
    isActive ? "text-accent-11" : "text-neutral-10 group-hover:text-accent-11"
  ), [isActive, collapsed])

  const Component = item.href ? Link : 'button'

  return (
    <Component
      href={item.href || '#'}
      className={itemClasses}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-9 rounded-r-full" />
      )}
      
      {/* Icon */}
      <item.icon className={iconClasses} aria-hidden="true" />
      
      {/* Label and badge */}
      {!collapsed && (
        <>
          <span className="flex-1 font-medium truncate">{item.label}</span>
          
          {item.badge && (
            <Badge variant={item.badge.variant} size="sm" className="ml-auto">
              {item.badge.text}
            </Badge>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-neutral-12 text-neutral-1 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
          {item.label}
          {item.badge && ` • ${item.badge.text}`}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-12 rotate-45" />
        </div>
      )}
    </Component>
  )
})

// Memoized navigation group component
const NavGroupComponent = memo(function NavGroupComponent({
  group,
  activeId,
  collapsed,
  onItemClick
}: {
  group: NavGroup
  activeId: string
  collapsed: boolean
  onItemClick?: () => void
}) {
  if (collapsed) {
    return (
      <div className="space-y-2">
        {group.items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="px-3 text-xs font-semibold text-neutral-10 uppercase tracking-wider">
        {group.label}
      </h3>
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  )
})

// Main sidebar component
export const Sidebar = memo(function Sidebar({ 
  collapsed, 
  onToggle, 
  isMobile = false, 
  user 
}: SidebarProps) {
  const pathname = usePathname()

  // Memoized active ID calculation
  const activeId = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const mainPath = pathSegments[0] || 'dashboard'
    
    // Handle nested routes
    if (mainPath === 'ai' && pathSegments[1]) {
      return `${mainPath}-${pathSegments[1]}`
    }
    
    return mainPath
  }, [pathname])

  // Handle navigation item clicks (for mobile)
  const handleItemClick = useCallback(() => {
    if (isMobile) {
      // Small delay to allow navigation to start before closing sidebar
      setTimeout(() => {
        onToggle()
      }, 150)
    }
  }, [isMobile, onToggle])

  // Handle quick note creation
  const handleQuickNote = useCallback(() => {
    window.location.href = '/notes/create'
    if (isMobile) {
      onToggle()
    }
  }, [isMobile, onToggle])

  // Memoized container classes
  const containerClasses = useMemo(() => cn(
    "h-full bg-bg border-r border-neutral-6 flex flex-col shadow-lg relative overflow-hidden",
    "transition-all duration-300 ease-out"
  ), [])

  return (
    <div className={containerClasses}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-neutral-1 to-neutral-2 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-neutral-6">
        {!collapsed ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
            aria-label="AI Notes - Go to dashboard"
          >
            <div className="relative p-2 bg-gradient-to-br from-accent-3 to-accent-secondary-3 rounded-xl group-hover:shadow-lg transition-all duration-200 border border-neutral-6">
              <Sparkles className="h-5 w-5 text-accent-11" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-gradient-primary">
                AI Notes
              </span>
              <span className="text-xs text-neutral-10 font-medium">
                Smart workspace
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="flex items-center justify-center group transition-all duration-200 hover:scale-105 mx-auto"
            aria-label="AI Notes - Go to dashboard"
          >
            <div className="relative p-2 bg-gradient-to-br from-accent-3 to-accent-secondary-3 rounded-xl group-hover:shadow-lg transition-all duration-200 border border-neutral-6">
              <Sparkles className="h-5 w-5 text-accent-11" aria-hidden="true" />
            </div>
          </Link>
        )}

        {/* Quick actions for collapsed state */}
        {collapsed && (
          <div className="mt-4 flex justify-center">
            <IconButton
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleQuickNote}
              className="w-10 h-10 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              aria-label="Create new note"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav 
        className="relative z-10 flex-1 overflow-y-auto p-4 space-y-6" 
        role="navigation" 
        aria-label="Main navigation"
      >
        {NAVIGATION_ITEMS.map((group) => (
          <NavGroupComponent
            key={group.id}
            group={group}
            activeId={activeId}
            collapsed={collapsed}
            onItemClick={handleItemClick}
          />
        ))}
      </nav>

      {/* Quick action for expanded state */}
      {!collapsed && (
        <div className="relative z-10 p-4 border-t border-neutral-6">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleQuickNote}
            className="w-full rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Create Note
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-neutral-6 bg-gradient-to-r from-accent-3/10 to-accent-secondary-3/10">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-10 font-medium">
                AI Notes v1.0
              </div>
              <Badge variant="accent" size="sm" className="px-2 py-1">
                Beta
              </Badge>
            </div>
            
            {/* Keyboard hint */}
            <div className="mt-2 text-xs text-neutral-9 flex items-center gap-1">
              <Terminal className="h-3 w-3" />
              <span>Press ⌘\ to toggle</span>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <Badge variant="accent" size="sm" className="px-1.5 py-1 text-xs">
              β
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'
