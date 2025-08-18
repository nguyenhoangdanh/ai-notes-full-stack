'use client'

import {
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Button } from '../ui/button'
import { ThemeToggle } from '../common/ThemeToggle'
import { UserMenu } from '../header/UserMenu'
import { NotificationBell } from '../notifications/NotificationBell'
import { GlobalSearch } from '../search/GlobalSearch'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
  isMobile: boolean
}

export function Header({ onMenuClick, sidebarOpen, isMobile }: HeaderProps) {
  return (
    <header
      className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30"
      role="banner"
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className={cn(
              "h-9 w-9 p-0 transition-colors hover:bg-accent/80",
              isMobile ? "" : "lg:flex"
            )}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            {isMobile && sidebarOpen ? (
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>

          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>
        </div>

        {/* Right section */}
        <nav className="flex items-center gap-2" role="navigation" aria-label="User menu">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
          </div>
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}
