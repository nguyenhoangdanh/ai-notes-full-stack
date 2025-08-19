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
  Bars3Icon,
  XMarkIcon,
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
  BellIcon,
  SparklesIcon,
  ChevronRightIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
  badge?: string | number
  children?: NavigationItem[]
  shortcut?: string
}

// Memoized navigation data for performance
const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Overview and recent activity',
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
    description: 'Organize with workspaces',
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
      { name: 'Suggestions', href: '/ai/suggestions', icon: SparklesIcon },
      { name: 'Summaries', href: '/ai/summaries', icon: DocumentDuplicateIcon },
    ]
  },
  {
    name: 'Productivity',
    href: '/productivity',
    icon: CheckCircleIcon,
    description: 'Tasks and time management',
    children: [
      { name: 'Tasks', href: '/productivity/tasks', icon: CheckCircleIcon },
      { name: 'Pomodoro', href: '/productivity/pomodoro', icon: ClockIcon },
      { name: 'Calendar', href: '/productivity/calendar', icon: CalendarIcon },
      { name: 'Review', href: '/productivity/review', icon: BookOpenIcon },
    ]
  },
  {
    name: 'Mobile',
    href: '/mobile',
    icon: MicrophoneIcon,
    description: 'Mobile-specific features',
    children: [
      { name: 'Voice Notes', href: '/voice-notes', icon: MicrophoneIcon },
      { name: 'Location Notes', href: '/mobile/location-notes', icon: MapPinIcon },
      { name: 'Sync', href: '/mobile/sync', icon: CloudArrowUpIcon },
    ]
  },
  {
    name: 'Collaboration',
    href: '/collaboration',
    icon: UserGroupIcon,
    description: 'Share and collaborate',
    children: [
      { name: 'Shared Notes', href: '/collaboration/shared', icon: DocumentTextIcon },
      { name: 'Permissions', href: '/collaboration/permissions', icon: UserGroupIcon },
    ]
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: DocumentDuplicateIcon,
    description: 'Note templates',
    children: [
      { name: 'All Templates', href: '/templates', icon: DocumentDuplicateIcon },
      { name: 'Create Template', href: '/templates/create', icon: PlusIcon },
    ]
  },
  {
    name: 'Search',
    href: '/search',
    icon: MagnifyingGlassIcon,
    description: 'Advanced search',
    shortcut: '⌘K'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    description: 'Usage insights'
  },
  {
    name: 'Export',
    href: '/export',
    icon: ArrowUpTrayIcon,
    description: 'Export your data'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: 'App settings',
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Memoized functions for performance
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

  // Memoized sections for performance
  const navigationSections = useMemo(() => {
    const sections = []
    let currentSection = []
    
    navigation.forEach((item, index) => {
      currentSection.push(item)
      
      // Create sections at specific breakpoints
      if (index === 3 || index === 7 || index === navigation.length - 1) {
        sections.push([...currentSection])
        currentSection = []
      }
    })
    
    return sections
  }, [])

  // Render navigation item
  const renderNavItem = useCallback((item: NavigationItem, isSubItem = false) => {
    const active = isActive(item.href)
    const expanded = isExpanded(item.href)
    const hasChildren = item.children && item.children.length > 0

    if (collapsed && !isSubItem) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center justify-center h-12 w-12 rounded-xl transition-all duration-200 mx-auto group relative",
                "hover:scale-105 active:scale-95",
                active
                  ? "bg-gradient-to-br from-accent/90 to-accent text-accent-foreground shadow-colored scale-105"
                  : "hover:bg-accent/10 text-muted-foreground hover:text-foreground glass-effect"
              )}
              aria-label={item.name}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              
              {/* Active indicator */}
              {active && (
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-accent-secondary rounded-full border-2 border-background animate-pulse" />
              )}
              
              {/* Badge for new features */}
              {item.badge && (
                <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-gradient-to-r from-accent-secondary to-accent text-white text-xs rounded-full flex items-center justify-center px-1">
                  {item.badge}
                </div>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <div className="space-y-1">
              <div className="font-semibold">{item.name}</div>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
              {item.shortcut && (
                <div className="flex items-center gap-1 text-xs">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">{item.shortcut}</kbd>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <li key={item.href} className={cn(isSubItem && "ml-6")}>
        <div
          className={cn(
            "flex items-center rounded-xl transition-all duration-200 group relative",
            isSubItem ? "px-3 py-2" : "px-3 py-3",
            active
              ? "bg-gradient-to-r from-accent/90 to-accent text-accent-foreground shadow-colored"
              : "hover:bg-accent/10 text-muted-foreground hover:text-foreground",
            hasChildren && "cursor-pointer"
          )}
          onClick={() => {
            if (hasChildren && !isSubItem) {
              toggleExpanded(item.href)
            }
          }}
          onMouseEnter={() => setHoveredItem(item.href)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={item.href} className="flex items-center flex-1 min-w-0">
            <div className="flex-shrink-0 mr-3">
              <item.icon className={cn("transition-transform duration-200", isSubItem ? "h-4 w-4" : "h-5 w-5")} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <span className={cn("font-medium truncate block", isSubItem ? "text-sm" : "text-sm")}>
                {item.name}
              </span>
              {item.description && !active && !isSubItem && (
                <span className="text-xs text-muted-foreground/70 truncate block leading-tight">
                  {item.description}
                </span>
              )}
            </div>
          </Link>

          {/* Badges and indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.badge && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-accent/20 text-accent-foreground border-accent/30">
                {item.badge}
              </Badge>
            )}
            
            {item.shortcut && !isSubItem && (
              <kbd className="hidden group-hover:flex px-1.5 py-0.5 bg-muted/50 rounded text-xs font-mono items-center">
                {item.shortcut}
              </kbd>
            )}

            {hasChildren && !isSubItem && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(item.href)
                }}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.name} submenu`}
              >
                <ChevronRightIcon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    expanded ? "rotate-90" : ""
                  )}
                  aria-hidden="true"
                />
              </Button>
            )}

            {active && (
              <div className="w-2 h-2 bg-accent-secondary rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Sub-navigation */}
        {hasChildren && expanded && !collapsed && (
          <ul className="mt-2 space-y-1 border-l border-border/40 pl-4 ml-6">
            {item.children!.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                    isActive(child.href)
                      ? "bg-accent/20 text-accent-foreground font-medium"
                      : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <child.icon className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{child.name}</span>
                  {isActive(child.href) && (
                    <div className="ml-auto w-2 h-2 bg-accent rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }, [collapsed, isActive, isExpanded, toggleExpanded, hoveredItem])

  return (
    <div
      ref={sidebarRef}
      className="h-full glass-effect-strong border-r border-border/60 flex flex-col shadow-xl lg:shadow-lg transition-all duration-300 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/98 to-background pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="relative p-2.5 bg-gradient-to-br from-accent/20 via-accent/15 to-accent-secondary/10 rounded-xl group-hover:from-accent/30 group-hover:to-accent-secondary/20 transition-all duration-200 shadow-sm">
                <SparklesIcon className="h-6 w-6 text-gradient-primary" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-none text-gradient bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                  AI Notes
                </span>
                <span className="text-xs text-muted-foreground font-medium tracking-wide">
                  Intelligent Platform
                </span>
              </div>
            </Link>
          )}
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-9 w-9 p-0 hover:bg-accent/10 transition-all duration-200 hover:scale-105"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>

        {/* Quick actions bar for collapsed state */}
        {collapsed && (
          <div className="mt-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-10 p-0 hover:bg-accent/10"
              aria-label="Create new note"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-10 p-0 hover:bg-accent/10"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto p-4 scroll-smooth" role="navigation" aria-label="Main navigation">
        <div className="space-y-6">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {sectionIndex > 0 && !collapsed && (
                <Separator className="my-4 opacity-60" />
              )}
              <ul className="space-y-1">
                {section.map((item) => renderNavItem(item))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="relative z-10 p-4 border-t border-border/40 bg-gradient-to-r from-accent/5 via-transparent to-accent-secondary/5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-medium">
              AI Notes v1.0.0
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs px-2.5 py-1 bg-gradient-to-r from-accent/20 to-accent-secondary/20 text-accent-foreground border-accent/30 shadow-sm"
            >
              Beta
            </Badge>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="mt-2 text-xs text-muted-foreground/60 flex items-center gap-1">
            <CommandLineIcon className="h-3 w-3" />
            <span>Press ⌘\ to toggle</span>
          </div>
        </div>
      )}
    </div>
  )
}
