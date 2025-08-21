'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  loading?: boolean
  onClear?: () => void
  showClearButton?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'glass'
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    loading = false,
    onClear,
    showClearButton = true,
    size = 'md',
    variant = 'default',
    className,
    value,
    onChange,
    placeholder = 'Search...',
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    
    const sizes = {
      sm: 'pl-8 pr-8 py-2 text-sm',
      md: 'pl-10 pr-10 py-2.5 text-sm',
      lg: 'pl-12 pr-12 py-3 text-base'
    }
    
    const iconSizes = {
      sm: { icon: 'w-3.5 h-3.5', left: 'left-2.5', right: 'right-2.5' },
      md: { icon: 'w-4 h-4', left: 'left-3', right: 'right-3' },
      lg: { icon: 'w-5 h-5', left: 'left-3.5', right: 'right-3.5' }
    }
    
    const baseClasses = 'form-input relative w-full'
    const variantClasses = variant === 'glass' ? 'glass' : ''
    
    const inputClasses = cn(
      baseClasses,
      variantClasses,
      sizes[size],
      isFocused && 'ring-2 ring-primary-600/20',
      className
    )
    
    const hasValue = value && String(value).length > 0
    const showClear = showClearButton && hasValue && !loading
    
    const handleClear = () => {
      if (onClear) {
        onClear()
      } else if (onChange) {
        // Create a synthetic event for clearing
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }
    
    return (
      <div className="relative">
        <div className={`absolute ${iconSizes[size].left} top-1/2 transform -translate-y-1/2 pointer-events-none`}>
          {loading ? (
            <Loader2 className={`${iconSizes[size].icon} text-text-subtle animate-spin`} />
          ) : (
            <Search className={`${iconSizes[size].icon} text-text-subtle`} />
          )}
        </div>
        
        <input
          ref={ref}
          type="search"
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        {showClear && (
          <button
            type="button"
            className={`absolute ${iconSizes[size].right} top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-bg-elev-1 transition-fast focus-ring`}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className={`${iconSizes[size].icon} text-text-subtle hover:text-text`} />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

// Specialized search input variants
interface QuickSearchProps extends SearchInputProps {
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
  showSuggestions?: boolean
}

export function QuickSearch({
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = false,
  ...props
}: QuickSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion)
    setIsOpen(false)
  }
  
  return (
    <div className="relative">
      <SearchInput
        {...props}
        onFocus={(e) => {
          setIsOpen(showSuggestions && suggestions.length > 0)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          // Delay closing to allow suggestion clicks
          setTimeout(() => setIsOpen(false), 200)
          props.onBlur?.(e)
        }}
      />
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 panel-glass border border-glass-border rounded-lg shadow-3 z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-bg-elev-1 transition-fast first:rounded-t-lg last:rounded-b-lg"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function GlobalSearchInput(props: SearchInputProps) {
  return (
    <SearchInput
      size="lg"
      variant="glass"
      placeholder="Search notes, categories, workspaces..."
      className="shadow-2"
      {...props}
    />
  )
}
