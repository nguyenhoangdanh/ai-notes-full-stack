'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Plus, Search, Star, Globe, User } from 'lucide-react'
import { useTemplates, useCreateTemplate } from '@/hooks/use-features'

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: myTemplates, isLoading: loadingMyTemplates } = useTemplates()
  // TODO: Add usePublicTemplates to use-features.ts
  const publicTemplates: any[] = []
  const loadingPublicTemplates = false
  
  // TODO: Add useTemplateCategories to use-features.ts  
  const categories: any[] = []
  const loadingCategories = false

  const filteredMyTemplates = myTemplates?.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const filteredPublicTemplates = publicTemplates?.filter((template: any) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/2 relative overflow-hidden">
      {/* Superhuman background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-2" />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Superhuman Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Templates</h1>
              <Star className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Create and manage reusable note templates
            </p>
          </div>
          <Button size="lg" className="gap-2 rounded-full superhuman-gradient superhuman-glow px-6 py-3">
            <Plus className="w-5 h-5" />
            Create Template
          </Button>
        </div>

      {/* Search and Filters */}
      <Card variant="glass" className="p-4 border-border/30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, categories, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-background/50 border-border/30"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 superhuman-glass border-border/30 rounded-full"
          >
            <FileText className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </Card>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium">Categories:</span>
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="rounded-full">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Templates Tabs */}
        <Tabs defaultValue="my-templates" className="space-y-6">
          <TabsList className="bg-muted/30 p-1 rounded-full border border-border/30">
            <TabsTrigger 
              value="my-templates" 
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4" />
              My Templates
            </TabsTrigger>
            <TabsTrigger 
              value="public-templates" 
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Globe className="w-4 h-4" />
              Public Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-templates" className="space-y-4">
            {loadingMyTemplates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} variant="glass" className="animate-pulse border-border/30">
                    <CardHeader>
                      <div className="h-4 bg-muted/50 rounded w-3/4 superhuman-transition"></div>
                      <div className="h-3 bg-muted/30 rounded w-full mt-2 superhuman-transition"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted/20 rounded superhuman-transition"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMyTemplates.length === 0 ? (
              <Card variant="glass" className="p-12 text-center border-border/30">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
                <h3 className="text-xl font-semibold mb-3">No templates found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? "No templates match your search criteria. Try adjusting your search terms."
                    : "Create your first template to get started and speed up your note-taking workflow."
                  }
                </p>
                <Button className="gap-2 rounded-full superhuman-gradient">
                  <Plus className="w-4 h-4" />
                  Create Template
                </Button>
              </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyTemplates.map((template, index) => (
                <Card 
                  key={template.id} 
                  variant="glass"
                  className="group cursor-pointer superhuman-hover border-border/30 animate-superhuman-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate group-hover:text-primary superhuman-transition">{template.name}</span>
                      {!template.isPublic && (
                        <Badge variant="secondary" className="rounded-full">Private</Badge>
                      )}
                    </CardTitle>
                    {template.description && (
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground line-clamp-3 p-3 bg-muted/20 rounded-lg">
                        {template.content}
                      </div>
                      
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs rounded-full">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs rounded-full">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                        <span>
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="w-3 h-3" />
                          <span>Use</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-templates" className="space-y-4">
          {loadingPublicTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPublicTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No public templates found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "No public templates match your search criteria"
                  : "No public templates are available at the moment"
                }
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPublicTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{template.name}</span>
                      <Badge variant="default">Public</Badge>
                    </CardTitle>
                    {template.description && (
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {template.content}
                      </div>
                      
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>Use</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  </div>
  )
}