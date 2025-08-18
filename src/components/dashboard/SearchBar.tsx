import { Input } from '../ui/input'
import { Search, Sparkle } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = "Search with AI...", className }: SearchBarProps) {
  const inputId = `search-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">
        Search notes
      </label>
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        id={inputId}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 bg-background"
        aria-describedby={value ? `search-results-count` : undefined}
        autoComplete="off"
        role="searchbox"
        aria-label="Search your notes"
      />
      <Sparkle
        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent pointer-events-none"
        aria-hidden="true"
        title="AI-powered search"
      />
    </div>
  )
}
