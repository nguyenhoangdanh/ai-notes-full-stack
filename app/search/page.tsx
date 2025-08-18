'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon, DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') || '')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = () => {
    setIsLoading(true)
    // Simulate search
    setTimeout(() => {
      setResults([
        { id: '1', type: 'note', title: 'Sample Note', content: 'This is a sample note...', score: 0.95 },
        { id: '2', type: 'workspace', title: 'Work Workspace', description: 'My work notes', score: 0.8 }
      ])
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    if (query) handleSearch()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-4">
        <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find notes, workspaces, and more</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex space-x-2">
          <Input
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={!query.trim()}>
            Search
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results ({results.length})</h2>
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {result.type === 'note' ? (
                    <DocumentTextIcon className="h-5 w-5 text-blue-500 mt-1" />
                  ) : (
                    <FolderIcon className="h-5 w-5 text-green-500 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{result.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.score * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.content || result.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}