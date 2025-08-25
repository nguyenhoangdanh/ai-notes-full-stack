import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive design using CSS media queries
 * Optimized for performance with proper cleanup and debouncing
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)
    
    // Create event listener with debouncing for performance
    let timeoutId: NodeJS.Timeout
    const listener = (event: MediaQueryListEvent) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setMatches(event.matches)
      }, 10) // Small debounce to prevent excessive re-renders
    }
    
    // Add listener with proper browser compatibility
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

/**
 * Common breakpoint hooks for convenience
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)')

/**
 * Hook for detecting device orientation
 */
export const useOrientation = () => {
  const isPortrait = useMediaQuery('(orientation: portrait)')
  return isPortrait ? 'portrait' : 'landscape'
}

/**
 * Hook for detecting high-resolution displays
 */
export const useIsHighDPI = () => useMediaQuery('(min-resolution: 2dppx)')
