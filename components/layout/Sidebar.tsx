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
  Target,
  Grid,
  Timer,
  FolderOpen,
  FileBarChart
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { SidebarNav, createMainNavGroup, createAINavGroup, createAccountNavGroup } from '../ui/SidebarNav'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  user?: any
}

// Memoized Sidebar component with modern styling
const Sidebar = memo(function Sidebar({ collapsed, onToggle, isMobile = false, user }: SidebarProps) {
  const pathname = usePathname()

  // Optimized active ID calculation
  const activeId = useMemo(() => {
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
    if (pathname.startsWith('/worksheets')) return 'worksheets'
    return 'dashboard'
  }, [pathname])

  // Enhanced navigation groups with worksheets
  const navGroups = useMemo(() => [
    {
      id: 'main',
      label: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Home,
          href: '/dashboard',
          active: activeId === 'dashboard'
        },
        {
          id: 'notes',
          label: 'Notes',
          icon: FileText,
          href: '/notes',
          active: activeId === 'notes'
        },
        {
          id: 'workspaces',
          label: 'Workspaces',
          icon: FolderOpen,
          href: '/workspaces',
          active: activeId === 'workspaces'
        },
        {
          id: 'worksheets',
          label: 'Worksheets',
          icon: Grid,
          href: '/worksheets',
          active: activeId === 'worksheets',
          badge: { text: 'New', variant: 'success' }
        },
        {
          id: 'categories',
          label: 'Categories',
          icon: Tag,
          href: '/categories',
          active: activeId === 'categories'
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
          active: activeId === 'ai-chat',
          badge: { text: 'AI', variant: 'ai' }
        },
        {
          id: 'summaries',
          label: 'Summaries',
          icon: FileBarChart,
          href: '/summaries',
          active: activeId === 'summaries'
        },
        {
          id: 'relations',
          label: 'Relations',
          icon: Network,
          href: '/relations',
          active: activeId === 'relations'
        },
        {
          id: 'duplicates',
          label: 'Duplicates',
          icon: Copy,
          href: '/duplicates',
          active: activeId === 'duplicates'
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
          active: activeId === 'analytics'
        },
        {
          id: 'productivity',
          label: 'Productivity',
          icon: Timer,
          href: '/productivity',
          active: activeId === 'productivity'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          href: '/settings',
          active: activeId === 'settings'
        }
      ]
    }
  ], [activeId])

  const handleNavigation = useCallback((href: string) => {
    window.location.href = href
  }, [])

  return (
    <div className={cn(
      "sidebar-modern h-full flex flex-col relative overflow-hidden",
      "transition-all duration-300 ease-out",
      collapsed ? "collapsed w-16" : "expanded w-72",
      isMobile && "fixed top-0 left-0 z-50 h-screen"
    )}>
      {/* Modern gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-900/50 dark:via-slate-800 dark:to-indigo-950/30 pointer-events-none" />
      
      {/* Header Section */}
      <div className="sidebar-header relative z-10">
        <div className="sidebar-header-content">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="sidebar-brand group"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="sidebar-brand-icon">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none text-white">
                  AI Notes
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  Smart workspace
                </span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center group transition-modern hover-lift"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="sidebar-brand-icon">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10" role="navigation" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-2">
            {/* Group Label */}
            {!collapsed && (
              <div className="px-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {group.label}
                </h3>
              </div>
            )}
            
            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem 
                  key={item.id} 
                  item={item} 
                  collapsed={collapsed}
                  onClick={() => handleNavigation(item.href)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Quick Actions for collapsed state */}
        {collapsed && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 rounded-xl transition-modern hover-lift hover:bg-blue-50 dark:hover:bg-slate-700"
                aria-label="Create new note"
                onClick={() => handleNavigation('/notes/create')}
              >
                <Plus className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 rounded-xl transition-modern hover-lift hover:bg-blue-50 dark:hover:bg-slate-700"
                aria-label="Search"
                onClick={() => handleNavigation('/search')}
              >
                <Search className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Footer Section */}
      <div className="relative z-10 p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-blue-50/30 via-transparent to-indigo-50/30 dark:from-slate-800/30 dark:to-slate-900/30">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                AI Notes v1.0
              </div>
              <Badge 
                variant="ai" 
                size="sm"
                className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"
              >
                Beta
              </Badge>
            </div>
            
            {/* Keyboard shortcut hint */}
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Terminal className="h-3 w-3" />
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">
                ⌘\
              </kbd>
              <span>to toggle</span>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Synced</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Badge 
              variant="ai" 
              size="sm"
              className="px-1.5 py-1 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"
            >
              β
            </Badge>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )
})

// Modern Navigation Item Component
function NavItem({ 
  item, 
  collapsed, 
  onClick 
}: { 
  item: any
  collapsed: boolean
  onClick: () => void 
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      <button
        className={cn(
          "sidebar-nav-item w-full group",
          item.active && "active",
          collapsed && "justify-center px-3"
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={item.label}
      >
        {/* Icon */}
        <item.icon className="sidebar-nav-icon" />
        
        {/* Label */}
        {!collapsed && (
          <>
            <span className="flex-1 font-medium truncate text-left">
              {item.label}
            </span>
            
            {/* Badge */}
            {item.badge && (
              <Badge 
                variant={item.badge.variant || 'default'} 
                size="sm"
                className="ml-auto"
              >
                {item.badge.text}
              </Badge>
            )}
          </>
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {collapsed && isHovered && (
        <div className="
          absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
          px-3 py-2 bg-slate-900 text-white text-sm rounded-lg
          pointer-events-none whitespace-nowrap
          opacity-0 animate-in fade-in-0 slide-in-from-left-2 duration-200
          dark:bg-slate-700
        "
        style={{ opacity: 1 }}
        >
          {item.label}
          {item.badge && (
            <span className="ml-2 text-xs opacity-75">• {item.badge.text}</span>
          )}
        </div>
      )}
    </div>
  )
}

Sidebar.displayName = 'Sidebar'

export { Sidebar }
