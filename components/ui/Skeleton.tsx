'use client'

import { CSSProperties } from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'rounded' | 'circle'
  animate?: boolean
  style?: CSSProperties
}

export function Skeleton({
  className = '',
  variant = 'default',
  animate = true,
  style
}: SkeletonProps) {
  const variants = {
    default: 'rounded',
    rounded: 'rounded-lg',
    circle: 'rounded-full'
  }

  return (
    <div
      className={cn(
        'skeleton bg-bg-elev-1',
        variants[variant],
        animate && 'animate-pulse',
        className
      )}
      style={style}
    />
  )
}

// Common skeleton patterns
export function SkeletonCard({
  className = '',
  lines = 3
}: {
  className?: string
  lines?: number
}) {
  return (
    <div className={cn('panel p-6 space-y-3', className)}>
      <div className="flex items-start gap-3">
        <Skeleton variant="circle" className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-3',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

export function SkeletonStatCard({ className = '' }: { className?: string }) {
  return (
    <div className={cn('panel p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton variant="rounded" className="w-10 h-10" />
      </div>
    </div>
  )
}

export function SkeletonList({
  count = 5,
  className = ''
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 panel rounded-lg">
          <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = ''
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn('panel overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border-soft">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-soft">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton
                key={j}
                className={cn(
                  'h-4 flex-1',
                  j === 0 && 'w-8 h-8 rounded-full flex-shrink-0',
                  j === columns - 1 && 'w-20 flex-shrink-0'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonGraph({ className = '' }: { className?: string }) {
  return (
    <div className={cn('panel p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-6" />
          ))}
        </div>

        {/* Graph area */}
        <div className="ml-12 h-full relative">
          <Skeleton className="w-full h-full" />

          {/* X-axis labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonHeader({ className = '' }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Skeleton className="h-4 w-96" />
    </div>
  )
}

export function SkeletonGrid({
  count = 6,
  columns = 3,
  className = ''
}: {
  count?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-3',
      columns === 4 && 'grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  )
}
