'use client'

import { useState } from 'react'
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
  SparklesIcon
} from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

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
      { name: 'Voice Notes', href: '/mobile/voice-notes', icon: MicrophoneIcon },
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
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

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
    <div className="h-full bg-card border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg">AI Notes</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <Bars3Icon className="h-4 w-4" /> : <XMarkIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.href}>
              <div>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center h-10 w-10 rounded-md transition-colors mx-auto",
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        if (item.children) {
                          toggleExpanded(item.href)
                        }
                      }}
                    >
                      <Link href={item.href} className="flex items-center flex-1">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                      {item.children && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(item.href)
                          }}
                        >
                          <span className={cn(
                            "transition-transform",
                            isExpanded(item.href) ? "rotate-90" : ""
                          )}>
                            ▶
                          </span>
                        </Button>
                      )}
                    </div>
                    
                    {/* Sub-navigation */}
                    {item.children && isExpanded(item.href) && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                                isActive(child.href)
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-muted"
                              )}
                            >
                              <child.icon className="h-4 w-4 mr-2" />
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            AI Notes v1.0.0
          </div>
        </div>
      )}
    </div>
  )
}