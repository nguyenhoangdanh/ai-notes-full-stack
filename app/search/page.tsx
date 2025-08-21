'use client'
import { Search, FileText, Folder, Filter, Sparkles, Clock, BarChart3 } from 'lucide-react'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Import new UI components
import { PageHeader } from '../../components/ui/PageHeader'
import { SearchInput } from '../../components/ui/SearchInput'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Panel } from '../../components/ui/Panel'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatCard } from '../../components/ui/StatCard'
import { Toolbar, ToolbarSection } from '../../components/ui/Toolbar'
import { Toggle } from '../../components/ui/Toggle'

function SearchContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') || '')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<'all' | 'notes' | 'workspaces'>('all')
  const [useAI, setUseAI] = useState(true)

  const handleSearch = () => {
    if (!query.trim()) return

    setIsLoading(true)
    // Simulate search
    setTimeout(() => {
      setResults([
        { id: '1', type: 'note', title: 'Meeting Notes - Q1 Planning', content: 'Discussed project roadmap and resource allocation for the upcoming quarter...', score: 0.95, lastModified: '2 hours ago', category: 'Work' },
        { id: '2', type: 'note', title: 'Research: AI in Productivity', content: 'Exploring how artificial intelligence can enhance note-taking and knowledge management...', score: 0.89, lastModified: '1 day ago', category: 'Research' },
        { id: '3', type: 'workspace', title: 'Work Projects', description: 'Contains all work-related notes and documents', score: 0.8, noteCount: 45 },
        { id: '4', type: 'note', title: 'Personal Goals 2024', content: 'Setting clear objectives for personal and professional growth...', score: 0.76, lastModified: '3 days ago', category: 'Personal' }
      ])
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    if (query) handleSearch()
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Search"
        subtitle="Find anything across your notes and workspaces"
        description="Use our AI-powered search to find content using natural language, discover related notes, and explore connections."
        icon={Search}
        badge={{ text: useAI ? 'AI-Powered' : 'Standard', variant: useAI ? 'ai' : 'default' }}
        actions={
          <Button variant="secondary" icon={Filter}>
            Advanced Filters
          </Button>
        }
      />

      {/* Search Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Results"
          value={results.length}
          subtitle="Found items"
          icon={BarChart3}
          iconColor="text-primary-600"
        />

        <StatCard
          title="Search Time"
          value="0.32s"
          subtitle="Response time"
          icon={Clock}
          iconColor="text-accent"
        />

        <StatCard
          title="Relevance"
          value="95%"
          subtitle="AI confidence"
          icon={Sparkles}
          iconColor="text-purple"
        />
      </div>

      {/* Search Panel */}
      <Panel
        title="Search"
        subtitle="Enter your query below"
        icon={Search}
        toolbar={
          <Toolbar size="sm" justify="end">
            <ToolbarSection>
              <Toggle
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                label="AI Search"
                size="sm"
              />
            </ToolbarSection>
          </Toolbar>
        }
      >
        <div className="space-y-6">
          {/* Search Input */}
          <div className="flex gap-3">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={useAI ? "Try: 'notes about project planning' or 'meeting notes from last week'" : "Search everything..."}
              size="lg"
              variant="glass"
              loading={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              variant="primary"
              icon={useAI ? Sparkles : Search}
              size="lg"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Type Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-muted">Search in:</span>
            <Badge
              variant={searchType === 'all' ? 'ai' : 'default'}
              className="cursor-pointer"
              onClick={() => setSearchType('all')}
            >
              All
            </Badge>
            <Badge
              variant={searchType === 'notes' ? 'ai' : 'default'}
              className="cursor-pointer"
              onClick={() => setSearchType('notes')}
            >
              Notes
            </Badge>
            <Badge
              variant={searchType === 'workspaces' ? 'ai' : 'default'}
              className="cursor-pointer"
              onClick={() => setSearchType('workspaces')}
            >
              Workspaces
            </Badge>
          </div>
        </div>
      </Panel>

      {/* Search Results */}
      {(results.length > 0 || query) && (
        <Panel
          title="Search Results"
          subtitle={isLoading ? 'Searching...' : `${results.length} results found`}
          icon={BarChart3}
          loading={isLoading}
        >
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded"></div>
                  <div className="skeleton h-4 w-1/2 rounded"></div>
                  <div className="skeleton h-3 w-full rounded"></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <Card
                  key={result.id}
                  variant="default"
                  className="p-4 hover-lift cursor-pointer transition-modern"
                  onClick={() => {
                    if (result.type === 'note') {
                      window.location.href = `/notes/${result.id}`
                    } else {
                      window.location.href = `/workspaces/${result.id}`
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.type === 'note'
                        ? 'bg-primary-600/10'
                        : 'bg-accent/10'
                    }`}>
                      {result.type === 'note' ? (
                        <FileText className={`w-5 h-5 ${
                          result.type === 'note' ? 'text-primary-600' : 'text-accent'
                        }`} />
                      ) : (
                        <Folder className="w-5 h-5 text-accent" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="font-semibold text-text hover:text-primary-600 transition-colors">
                          {result.title}
                        </h3>
                        <Badge variant={result.type === 'note' ? 'ai' : 'success'} size="sm">
                          {result.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-text-subtle">
                          <div className={`w-2 h-2 rounded-full ${
                            result.score > 0.9 ? 'bg-accent' :
                            result.score > 0.8 ? 'bg-warning' : 'bg-info'
                          }`} />
                          {Math.round(result.score * 100)}% match
                        </div>
                      </div>

                      <p className="text-sm text-text-muted mb-2 line-clamp-2">
                        {result.content || result.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-text-subtle">
                        {result.lastModified && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{result.lastModified}</span>
                          </div>
                        )}
                        {result.category && (
                          <Badge variant="default" size="sm">
                            {result.category}
                          </Badge>
                        )}
                        {result.noteCount && (
                          <span>{result.noteCount} notes</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : query && (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No results found for "${query}". Try different keywords or use AI search for better results.`}
              action={{
                label: "Try AI Search",
                onClick: () => setUseAI(true),
                icon: Sparkles,
                variant: "primary"
              }}
              secondaryAction={{
                label: "Clear Search",
                onClick: () => {
                  setQuery('')
                  setResults([])
                }
              }}
            />
          )}
        </Panel>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}
