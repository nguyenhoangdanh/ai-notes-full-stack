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
    <Card className="superhuman-glass superhuman-glow card-hover cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
              <FileText className="h-4 w-4 text-primary" />
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent">
                {template.name}
              </span>
            </CardTitle>
            {template.isDefault && (
              <Badge variant="secondary" className="text-xs mt-2 superhuman-gradient text-white">
                Default
              </Badge>
            )}
          </div>
          <Button size="sm" variant="outline" className="superhuman-hover border-primary/30 hover:bg-primary/10 hover:border-primary/50">
            <Zap className="h-3 w-3 mr-1" />
            Use
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {template.description && (
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{template.description}</p>
        )}
        
        <div className="flex flex-wrap gap-3 text-xs">
          {template.minWords && (
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              Min: {template.minWords} words
            </Badge>
          )}
          {template.maxWords && (
            <Badge variant="outline" className="border-accent/20 bg-accent/5 text-accent">
              Max: {template.maxWords} words
            </Badge>
          )}
          {template.usageCount !== undefined && (
            <Badge variant="outline" className="border-muted-foreground/20 bg-muted/5 text-muted-foreground">
              Used: {template.usageCount} times
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}