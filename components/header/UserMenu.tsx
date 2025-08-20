'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge, StatusBadge } from '../ui/badge'
import { QuickTooltip } from '../ui/tooltip'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '../ui/dropdown-menu'
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  Moon,
  Sun,
  Crown,
  Shield,
  HelpCircle,
  MessageSquare,
  Zap,
  Activity,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import { useTheme } from 'next-themes'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'

  const userStats = {
    notesCount: 42,
    workspacesCount: 3,
    collaborators: 8,
    plan: 'Pro',
    storageUsed: 67
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative h-10 gap-2 rounded-xl px-3 transition-modern",
            "hover:bg-surface-hover hover:shadow-1",
            "data-[state=open]:bg-surface-hover data-[state=open]:shadow-2",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
        >
          {/* Avatar with status indicator */}
          <div className="relative">
            <Avatar className="h-7 w-7 border-2 border-border shadow-1">
              <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {/* Online status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-surface shadow-sm" />
          </div>
          
          {/* User info - hidden on mobile */}
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-sm font-medium text-text truncate max-w-24">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-text-muted truncate max-w-24">
              {user?.email}
            </p>
          </div>
          
          <ChevronDown className={cn(
            "h-3 w-3 text-text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className={cn(
          "w-80 p-0 glass border border-border-subtle shadow-5",
          "rounded-2xl overflow-hidden"
        )}
        align="end"
        sideOffset={8}
      >
        {/* User Profile Header */}
        <div className="p-6 pb-4 bg-gradient-to-br from-brand-50/80 to-brand-100/50 border-b border-border-subtle">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white shadow-2">
                <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <StatusBadge 
                status="active" 
                showDot={true}
                className="absolute -bottom-1 -right-1 scale-75"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-text truncate">
                  {user?.name || 'User'}
                </h3>
                {userStats.plan === 'Pro' && (
                  <Badge variant="gradient" size="xs" leftIcon={<Crown className="h-3 w-3" />}>
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-sm text-text-muted truncate">
                {user?.email}
              </p>
              
              {/* Quick stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{userStats.notesCount}</span>
                  <span>notes</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{userStats.workspacesCount}</span>
                  <span>workspaces</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{userStats.storageUsed}%</span>
                  <span>storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border-subtle">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-3 flex flex-col items-center gap-1.5 rounded-xl hover:bg-brand-50"
            >
              <Activity className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-medium">Activity</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-3 flex flex-col items-center gap-1.5 rounded-xl hover:bg-brand-50"
            >
              <Zap className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-medium">AI Tools</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-auto p-3 flex flex-col items-center gap-1.5 rounded-xl hover:bg-brand-50"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-brand-600" />
              ) : (
                <Moon className="h-4 w-4 text-brand-600" />
              )}
              <span className="text-xs font-medium">Theme</span>
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuGroup>
            <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer group">
              <User className="h-4 w-4 mr-3 text-text-muted group-hover:text-brand-600" />
              <span className="font-medium">Profile Settings</span>
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer group">
              <Settings className="h-4 w-4 mr-3 text-text-muted group-hover:text-brand-600" />
              <span className="font-medium">Preferences</span>
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer group">
              <Bell className="h-4 w-4 mr-3 text-text-muted group-hover:text-brand-600" />
              <span className="font-medium">Notifications</span>
              <Badge variant="secondary" size="xs" className="ml-auto">3</Badge>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuGroup>
            <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer group">
              <CreditCard className="h-4 w-4 mr-3 text-text-muted group-hover:text-brand-600" />
              <div className="flex-1 flex items-center justify-between">
                <span className="font-medium">Billing & Plans</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 bg-brand-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${userStats.storageUsed}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted">{userStats.storageUsed}%</span>
                </div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer group">
              <Shield className="h-4 w-4 mr-3 text-text-muted group-hover:text-brand-600" />
              <span className="font-medium">Privacy & Security</span>
              <CheckCircle2 className="h-3 w-3 ml-auto text-success" />
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuGroup>
            <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer group">
              <HelpCircle className="h-4 w-4 mr-3 text-text-muted group-hover:text-brand-600" />
              <span className="font-medium">Help & Support</span>
              <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer group">
              <MessageSquare className="h-4 w-4 mr-3 text-text-muted group-hover:text-brand-600" />
              <span className="font-medium">Send Feedback</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem 
            className="rounded-xl h-11 px-4 cursor-pointer group text-danger focus:text-danger focus:bg-danger-bg"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="font-medium">Sign Out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </div>

        {/* Upgrade Banner for Free users */}
        {userStats.plan !== 'Pro' && (
          <div className="p-4 border-t border-border-subtle bg-gradient-to-r from-brand-50 to-brand-100">
            <Card variant="feature" className="p-4 border-brand-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-brand-800">Upgrade to Pro</h4>
                  <p className="text-xs text-brand-600">Unlock unlimited AI features</p>
                </div>
                <Button variant="gradient" size="sm" className="rounded-xl">
                  Upgrade
                </Button>
              </div>
            </Card>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
