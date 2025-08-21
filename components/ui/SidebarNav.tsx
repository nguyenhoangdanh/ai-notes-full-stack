'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Badge, CountBadge } from './Badge'
import { cn } from '../../lib/utils'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  active?: boolean
  badge?: {
    text: string
    variant?: 'default' | 'ai' | 'success' | 'warning' | 'danger'
  }
  count?: number
  disabled?: boolean
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
  collapsed?: boolean
  onToggle?: () => void
}

interface SidebarNavProps {
  groups: NavGroup[]
  className?: string
  compact?: boolean
}

export function SidebarNav({ 
  groups, 
  className = '',
  compact = false 
}: SidebarNavProps) {
  return (
    <nav className={`space-y-6 ${className}`} role="navigation" aria-label="Main navigation">
      {groups.map((group) => (
        <NavGroupComponent 
          key={group.id} 
          group={group} 
          compact={compact}
        />
      ))}
    </nav>
  )
}

function NavGroupComponent({ 
  group, 
  compact 
}: { 
  group: NavGroup
  compact: boolean 
}) {
  if (compact && group.collapsed) {
    return null
  }

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center justify-between px-3">
          <h3 className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
            {group.label}
          </h3>
          {group.onToggle && (
            <button
              onClick={group.onToggle}
              className="text-text-subtle hover:text-text transition-fast p-1 rounded focus-ring"
              aria-label={`${group.collapsed ? 'Expand' : 'Collapse'} ${group.label} group`}
            >
              <svg 
                className={`w-3 h-3 transition-transform ${group.collapsed ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {!group.collapsed && (
        <div className="space-y-1">
          {group.items.map((item) => (
            <NavItemComponent 
              key={item.id} 
              item={item} 
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NavItemComponent({ 
  item, 
  compact 
}: { 
  item: NavItem
  compact: boolean 
}) {
  const Component = item.href ? 'a' : 'button'
  
  const baseClasses = `
    group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left
    transition-modern focus-ring
    ${item.disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:bg-bg-elev-1 hover:text-text active:bg-bg-elev-2'
    }
    ${item.active 
      ? 'bg-bg-elev-1 text-text shadow-sm border border-border-soft' 
      : 'text-text-muted'
    }
  `
  
  const iconClasses = cn(
    'w-5 h-5 flex-shrink-0 transition-colors',
    item.active ? 'text-primary-600' : 'text-text-subtle group-hover:text-text'
  )
  
  const handleClick = () => {
    if (!item.disabled && item.onClick) {
      item.onClick()
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
      e.preventDefault()
      handleClick()
    }
  }
  
  return (
    <Component
      className={baseClasses}
      href={item.href}
      onClick={!item.href ? handleClick : undefined}
      onKeyDown={!item.href ? handleKeyDown : undefined}
      disabled={item.disabled}
      aria-current={item.active ? 'page' : undefined}
      role={!item.href ? 'button' : undefined}
      tabIndex={item.disabled ? -1 : 0}
    >
      {/* Active indicator */}
      {item.active && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-600 rounded-r" />
      )}
      
      {/* Icon */}
      <item.icon className={iconClasses} />
      
      {/* Label and badges */}
      {!compact && (
        <>
          <span className="flex-1 font-medium truncate">
            {item.label}
          </span>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.count !== undefined && item.count > 0 && (
              <CountBadge count={item.count} />
            )}
            
            {item.badge && (
              <Badge variant={item.badge.variant || 'default'} size="sm">
                {item.badge.text}
              </Badge>
            )}
          </div>
        </>
      )}
      
      {/* Tooltip for compact mode */}
      {compact && (
        <div className="
          absolute left-full ml-2 px-2 py-1 bg-panel border border-border rounded-md text-xs
          text-text whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 pointer-events-none z-50
        ">
          {item.label}
          {item.badge && ` • ${item.badge.text}`}
        </div>
      )}
    </Component>
  )
}

// Preset navigation configurations
export function createMainNavGroup(activeId?: string): NavGroup {
  return {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: require('lucide-react').LayoutDashboard,
        href: '/dashboard',
        active: activeId === 'dashboard'
      },
      {
        id: 'notes',
        label: 'Notes',
        icon: require('lucide-react').FileText,
        href: '/notes',
        active: activeId === 'notes'
      },
      {
        id: 'workspaces',
        label: 'Workspaces',
        icon: require('lucide-react').FolderOpen,
        href: '/workspaces',
        active: activeId === 'workspaces'
      },
      {
        id: 'categories',
        label: 'Categories',
        icon: require('lucide-react').Tag,
        href: '/categories',
        active: activeId === 'categories'
      }
    ]
  }
}

export function createAINavGroup(activeId?: string): NavGroup {
  return {
    id: 'ai',
    label: 'AI Features',
    items: [
      {
        id: 'ai-chat',
        label: 'AI Assistant',
        icon: require('lucide-react').MessageSquare,
        href: '/ai/chat',
        active: activeId === 'ai-chat',
        badge: { text: 'AI', variant: 'ai' }
      },
      {
        id: 'summaries',
        label: 'Summaries',
        icon: require('lucide-react').FileBarChart,
        href: '/summaries',
        active: activeId === 'summaries'
      },
      {
        id: 'relations',
        label: 'Relations',
        icon: require('lucide-react').Network,
        href: '/relations',
        active: activeId === 'relations'
      },
      {
        id: 'duplicates',
        label: 'Duplicates',
        icon: require('lucide-react').Copy,
        href: '/duplicates',
        active: activeId === 'duplicates'
      }
    ]
  }
}

export function createAccountNavGroup(activeId?: string): NavGroup {
  return {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: require('lucide-react').BarChart3,
        href: '/analytics',
        active: activeId === 'analytics'
      },
      {
        id: 'productivity',
        label: 'Productivity',
        icon: require('lucide-react').Timer,
        href: '/productivity',
        active: activeId === 'productivity'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: require('lucide-react').Settings,
        href: '/settings',
        active: activeId === 'settings'
      }
    ]
  }
}
