import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Zap } from 'lucide-react'

interface SummaryTemplate {
  id: string
  name: string
  description?: string
  minWords?: number
  maxWords?: number
  usageCount?: number
  isDefault?: boolean
}

interface SummaryTemplateCardProps {
  template: SummaryTemplate
}

export function SummaryTemplateCard({ template }: SummaryTemplateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {template.name}
            </CardTitle>
            {template.isDefault && (
              <Badge variant="secondary" className="text-xs mt-1">
                Default
              </Badge>
            )}
          </div>
          <Button size="sm" variant="outline">
            <Zap className="h-3 w-3 mr-1" />
            Use
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {template.description && (
          <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {template.minWords && (
            <span>Min: {template.minWords} words</span>
          )}
          {template.maxWords && (
            <span>Max: {template.maxWords} words</span>
          )}
          {template.usageCount !== undefined && (
            <span>Used: {template.usageCount} times</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}