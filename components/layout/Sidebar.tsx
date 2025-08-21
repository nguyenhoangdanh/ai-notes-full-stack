'use client'

import { useState, useRef } from 'react'
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
  ChevronRightIcon
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
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Overview and recent activity'
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
    description: 'Advanced search'
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
    description: 'App settings'
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

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  const isExpanded = (href: string) => {
    return expandedItems.includes(href)
  }

  return (
    <div
      ref={sidebarRef}
      className="h-full bg-card/50 backdrop-blur-xl border-r border-border/60 flex flex-col shadow-lg lg:shadow-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group transition-colors hover:text-primary"
              aria-label="AI Notes - Go to dashboard"
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <SparklesIcon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">AI Notes</span>
                <span className="text-xs text-muted-foreground">Intelligent Platform</span>
              </div>
            </Link>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-9 w-9 p-0 hover:bg-accent/80 transition-colors"
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" role="navigation" aria-label="Main navigation">
        <ul className="space-y-2">
          {navigation.map((item, index) => {
            const isMainSection = index === 0 || index === 4 || index === 8
            return (
              <li key={item.href}>
                {isMainSection && index > 0 && !collapsed && (
                  <Separator className="my-4 opacity-60" />
                )}

                <div>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-200 mx-auto group relative",
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground shadow-md scale-105"
                              : "hover:bg-accent/80 hover:scale-105 text-muted-foreground hover:text-foreground"
                          )}
                          aria-label={item.name}
                        >
                          <item.icon className="h-5 w-5" aria-hidden="true" />
                          {isActive(item.href) && (
                            <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        <div>
                          {item.name}
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "flex items-center px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                          if (item.children) {
                            toggleExpanded(item.href)
                          }
                        }}
                      >
                        <Link href={item.href} className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-3">
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">{item.name}</span>
                            {item.description && !isActive(item.href) && (
                              <span className="text-xs text-muted-foreground/70 truncate block">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </Link>
                        {item.children && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 flex-shrink-0 opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpanded(item.href)
                            }}
                            aria-label={`${isExpanded(item.href) ? 'Collapse' : 'Expand'} ${item.name} submenu`}
                          >
                            <ChevronRightIcon
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded(item.href) ? "rotate-90" : ""
                              )}
                              aria-hidden="true"
                            />
                          </Button>
                        )}
                      </div>

                      {/* Sub-navigation */}
                      {item.children && isExpanded(item.href) && (
                        <ul className="ml-6 mt-2 space-y-1 border-l border-border/40 pl-4">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                                  isActive(child.href)
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <child.icon className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{child.name}</span>
                                {isActive(child.href) && (
                                  <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              AI Notes v1.0.0
            </div>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Beta
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
