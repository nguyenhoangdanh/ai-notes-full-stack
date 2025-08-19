'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpenIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  MicrophoneIcon,
  MapPinIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  ChevronRightIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
  badge?: string | number
  children?: NavigationItem[]
  shortcut?: string
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Overview and insights',
    shortcut: '⌘1'
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: DocumentTextIcon,
    description: 'All your notes',
    children: [
      { name: 'All Notes', href: '/notes', icon: DocumentTextIcon },
      { name: 'Create Note', href: '/notes/create', icon: PlusIcon },
    ]
  },
  {
    name: 'Workspaces',
    href: '/workspaces',
    icon: FolderIcon,
    description: 'Organize projects',
    children: [
      { name: 'All Workspaces', href: '/workspaces', icon: FolderIcon },
      { name: 'Create Workspace', href: '/workspaces/create', icon: PlusIcon },
    ]
  },
  {
    name: 'AI Assistant',
    href: '/ai',
    icon: SparklesIcon,
    description: 'AI-powered features',
    badge: 'New',
    children: [
      { name: 'AI Chat', href: '/ai/chat', icon: ChatBubbleLeftIcon },
    ]
  },
  {
    name: 'Productivity',
    href: '/productivity',
    icon: CheckCircleIcon,
    description: 'Tasks and time',
    children: [
      { name: 'Tasks', href: '/productivity/tasks', icon: CheckCircleIcon },
      { name: 'Pomodoro', href: '/productivity/pomodoro', icon: ClockIcon },
    ]
  },
  {
    name: 'Voice Notes',
    href: '/voice-notes',
    icon: MicrophoneIcon,
    description: 'Record and transcribe',
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: DocumentDuplicateIcon,
    description: 'Note templates',
  },
  {
    name: 'Search',
    href: '/search',
    icon: MagnifyingGlassIcon,
    description: 'Find anything',
    shortcut: '⌘K'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    description: 'Usage insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: 'Preferences',
    shortcut: '⌘,'
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

  // Superhuman navigation renderer
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
              "flex items-center justify-center h-10 w-10 rounded-full superhuman-transition mx-auto relative",
              "superhuman-hover",
              active
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg superhuman-glow scale-105"
                : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
            )}
            aria-label={item.name}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            
            {/* Active pulse */}
            {active && (
              <div className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
            )}
            
            {/* New badge */}
            {item.badge && (
              <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-gradient-to-r from-accent to-primary text-white text-xs rounded-full flex items-center justify-center px-1 shadow-md">
                {item.badge}
              </div>
            )}
          </Link>
          
          {/* Superhuman tooltip */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-popover/95 text-popover-foreground text-sm rounded-xl opacity-0 group-hover:opacity-100 superhuman-transition pointer-events-none z-50 whitespace-nowrap shadow-xl backdrop-blur-sm border border-border/30">
            <div className="font-medium">{item.name}</div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            )}
            {item.shortcut && (
              <div className="flex items-center gap-1 text-xs mt-1">
                <kbd className="px-1 py-0.5 bg-muted/50 rounded text-xs">{item.shortcut}</kbd>
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
            "flex items-center rounded-xl superhuman-transition group relative",
            isSubItem ? "px-3 py-2" : "px-3 py-2.5",
            active
              ? "bg-gradient-to-r from-primary/20 via-primary/15 to-accent/10 text-primary shadow-sm"
              : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
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
                "superhuman-transition", 
                isSubItem ? "h-4 w-4" : "h-4 w-4",
                active ? "text-primary" : ""
              )} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <span className={cn(
                "font-medium truncate block", 
                isSubItem ? "text-sm" : "text-sm",
                active ? "text-primary" : ""
              )}>
                {item.name}
              </span>
              {item.description && !active && !isSubItem && (
                <span className="text-xs text-muted-foreground/60 truncate block leading-tight">
                  {item.description}
                </span>
              )}
            </div>
          </Link>

          {/* Right side indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.badge && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-accent/20 text-accent-foreground border-accent/30 superhuman-glow">
                {item.badge}
              </Badge>
            )}
            
            {item.shortcut && !isSubItem && (
              <kbd className="hidden group-hover:flex px-1.5 py-0.5 bg-muted/30 rounded text-xs font-mono items-center superhuman-transition">
                {item.shortcut}
              </kbd>
            )}

            {hasChildren && !isSubItem && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-60 hover:opacity-100 superhuman-transition"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(item.href)
                }}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.name} submenu`}
              >
                <ChevronRightIcon
                  className={cn(
                    "h-3 w-3 superhuman-transition",
                    expanded ? "rotate-90" : ""
                  )}
                  aria-hidden="true"
                />
              </Button>
            )}

            {active && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Sub-navigation */}
        {hasChildren && expanded && !collapsed && (
          <ul className="mt-1 space-y-0.5 border-l border-border/30 pl-3 ml-6">
            {item.children!.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-lg text-sm superhuman-transition group",
                    isActive(child.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <child.icon className="h-3.5 w-3.5 mr-2 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{child.name}</span>
                  {isActive(child.href) && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
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
      className="h-full bg-background/60 border-r border-border/30 flex flex-col shadow-xl backdrop-blur-xl superhuman-glass relative overflow-hidden"
    >
      {/* Superhuman gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/98 to-background pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group superhuman-transition superhuman-hover"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="relative p-2 bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl group-hover:from-primary/30 group-hover:to-accent/20 superhuman-transition shadow-sm superhuman-glow">
                <SparklesIcon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI Notes
                </span>
                <span className="text-xs text-muted-foreground font-medium">
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
              className="w-full h-8 rounded-full superhuman-transition superhuman-hover hover:bg-primary/10"
              aria-label="Create new note"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto p-4 superhuman-scrollbar" role="navigation" aria-label="Main navigation">
        <ul className="space-y-1">
          {navigation.map((item) => renderNavItem(item))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="relative z-10 p-4 border-t border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-medium">
              AI Notes v1.0
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-1 bg-gradient-to-r from-accent/20 to-primary/20 text-accent-foreground border-accent/30 shadow-sm superhuman-glow"
            >
              Beta
            </Badge>
          </div>
          
          {/* Keyboard hint */}
          <div className="mt-2 text-xs text-muted-foreground/50 flex items-center gap-1">
            <CommandLineIcon className="h-3 w-3" />
            <span>Press ⌘\ to toggle</span>
          </div>
        </div>
      )}
    </div>
  )
}
