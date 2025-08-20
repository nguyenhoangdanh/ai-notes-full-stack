'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickTooltip } from '@/components/ui/tooltip'
import { Edit, Trash2, Tag, Hash, TrendingUp, Sparkles, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { type Category } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
  onView?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'feature'
}

export function CategoryCard({ 
  category, 
  onEdit, 
  onDelete, 
  onView,
  className,
  variant = 'default'
}: CategoryCardProps) {
  const noteCount = category._count?.notes || 0
  const isPopular = noteCount > 10
  const isNew = category.isAuto

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        variant={variant === 'feature' ? 'feature' : 'elevated'}
        interactive
        hover="lift"
        className={cn(
          "group cursor-pointer transition-all duration-200",
          "hover:border-brand-300 hover:shadow-3",
          variant === 'compact' && "p-4",
          isPopular && "ring-1 ring-brand-200 bg-gradient-to-br from-brand-50/50 to-transparent"
        )}
        onClick={onView}
      >
        <CardHeader className={cn(
          variant === 'compact' ? "pb-2" : "pb-3",
          "relative"
        )}>
          {/* Popularity indicator */}
          {isPopular && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2"
            >
              <Badge variant="gradient" size="xs" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Popular
              </Badge>
            </motion.div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Category Icon */}
              <div className={cn(
                "flex-shrink-0 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                variant === 'compact' ? "w-10 h-10" : "w-12 h-12",
                category.color 
                  ? `bg-${category.color}-100 text-${category.color}-600` 
                  : "bg-brand-100 text-brand-600"
              )}>
                {category.icon ? (
                  <span className={variant === 'compact' ? "text-lg" : "text-xl"}>
                    {category.icon}
                  </span>
                ) : (
                  <Tag className={variant === 'compact' ? "h-4 w-4" : "h-5 w-5"} />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className={cn(
                    "font-semibold text-text group-hover:text-brand-700 transition-colors truncate",
                    variant === 'compact' ? "text-base" : "text-lg"
                  )}>
                    {category.name}
                  </CardTitle>
                  
                  {isNew && (
                    <Badge variant="success" size="xs" className="gap-1 animate-pulse">
                      <Sparkles className="h-2 w-2" />
                      Auto
                    </Badge>
                  )}
                </div>
                
                {variant !== 'compact' && category.description && (
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onView}>
                  <Tag className="h-4 w-4 mr-2" />
                  View Notes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-danger focus:text-danger"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className={cn(
          variant === 'compact' ? "pt-0" : "pt-0",
          "space-y-4"
        )}>
          {/* Keywords */}
          {category.keywords && category.keywords.length > 0 && (
            <div className="space-y-2">
              {variant !== 'compact' && (
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-text-muted" />
                  <span className="text-xs font-medium text-text-secondary">Keywords</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {category.keywords.slice(0, variant === 'compact' ? 2 : 4).map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="outline" 
                    size="xs"
                    className="text-xs hover:bg-brand-50 hover:border-brand-200 transition-colors"
                  >
                    {keyword}
                  </Badge>
                ))}
                {category.keywords.length > (variant === 'compact' ? 2 : 4) && (
                  <QuickTooltip 
                    content={
                      <div className="space-y-1">
                        {category.keywords.slice(variant === 'compact' ? 2 : 4).map(keyword => (
                          <div key={keyword} className="text-xs">{keyword}</div>
                        ))}
                      </div>
                    }
                  >
                    <Badge variant="outline" size="xs" className="text-xs">
                      +{category.keywords.length - (variant === 'compact' ? 2 : 4)}
                    </Badge>
                  </QuickTooltip>
                )}
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Hash className="h-3 w-3" />
              <span className="font-medium">{noteCount}</span>
              <span className="text-text-muted">
                {noteCount === 1 ? 'note' : 'notes'}
              </span>
            </div>
            
            {category.updatedAt && (
              <div className="text-xs text-text-subtle">
                Updated {new Date(category.updatedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
          
          {/* Progress indicator for auto categories */}
          {isNew && category.confidence && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">AI Confidence</span>
                <span className="font-medium text-text-secondary">{category.confidence}%</span>
              </div>
              <div className="h-1.5 bg-bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.confidence}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
