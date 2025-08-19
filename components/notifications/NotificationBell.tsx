'use client'

import { useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/use-features'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: notifications = [] } = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                markAllAsRead.mutate()
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-background hover:bg-muted/50' 
                      : 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30'
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}