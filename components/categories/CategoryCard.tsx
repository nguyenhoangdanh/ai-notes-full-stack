import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Tag, Hash } from 'lucide-react'
import { type Category } from '@/types'

interface CategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {category.icon && (
              <span className="text-lg">{category.icon}</span>
            )}
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.isAuto && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Auto
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {category.description && (
          <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
        )}
        
        {category.keywords.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {category.keywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {category.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{category.keywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {category._count?.notes !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span>{category._count.notes} notes</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}