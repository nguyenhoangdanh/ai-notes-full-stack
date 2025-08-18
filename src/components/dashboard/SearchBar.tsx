import { Input } from '../ui/input'
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = "Search with AI...", className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 bg-background"
      />
      <Sparkle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent" weight="fill" />
    </div>
  )
}