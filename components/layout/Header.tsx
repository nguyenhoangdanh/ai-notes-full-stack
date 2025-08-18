'use client'

import { 
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ThemeToggle } from '../common/ThemeToggle'
import { UserMenu } from '../header/UserMenu'
import { NotificationBell } from '../notifications/NotificationBell'
import { GlobalSearch } from '../search/GlobalSearch'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-8 w-8 p-0 lg:hidden"
          >
            <Bars3Icon className="h-4 w-4" />
          </Button>
          
          <GlobalSearch />
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}