'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

type Theme = 'light' | 'dark' | 'system';

// Enhanced transition styles with better performance
const addTransitionStyles = () => {
  if (typeof document !== 'undefined' && !document.querySelector('#theme-transitions')) {
    const style = document.createElement('style');
    style.id = 'theme-transitions';
    style.textContent = `
      :root {
        color-scheme: light;
        --transition-duration: 400ms;
        --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
      }

      :root.dark {
        color-scheme: dark;
      }

      /* Smooth theme transitions */
      .theme-transition {
        transition: 
          background-color var(--transition-duration) var(--transition-easing),
          border-color var(--transition-duration) var(--transition-easing),
          color var(--transition-duration) var(--transition-easing),
          box-shadow var(--transition-duration) var(--transition-easing),
          backdrop-filter var(--transition-duration) var(--transition-easing);
      }

      /* Apply to all elements during theme change */
      .theme-changing * {
        transition: 
          background-color var(--transition-duration) var(--transition-easing),
          border-color var(--transition-duration) var(--transition-easing),
          color var(--transition-duration) var(--transition-easing),
          box-shadow var(--transition-duration) var(--transition-easing),
          backdrop-filter var(--transition-duration) var(--transition-easing),
          fill var(--transition-duration) var(--transition-easing),
          stroke var(--transition-duration) var(--transition-easing);
      }

      /* Disable transitions during initial setup */
      .theme-transition-disable * {
        transition: none !important;
      }

      /* Glass effects with smooth transitions */
      .glass-effect,
      .glass-effect-strong {
        transition: 
          background-color var(--transition-duration) var(--transition-easing),
          backdrop-filter var(--transition-duration) var(--transition-easing),
          border-color var(--transition-duration) var(--transition-easing),
          box-shadow var(--transition-duration) var(--transition-easing);
      }

      /* Theme transition animation */
      @keyframes themeChange {
        0% { opacity: 1; }
        50% { opacity: 0.8; }
        100% { opacity: 1; }
      }

      .theme-changing {
        animation: themeChange var(--transition-duration) var(--transition-easing);
      }

      /* Respect user's motion preferences */
      @media (prefers-reduced-motion: reduce) {
        :root {
          --transition-duration: 1ms;
        }
        
        *, *::before, *::after {
          animation-duration: 1ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 1ms !important;
        }
        
        .theme-changing {
          animation: none;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .theme-changing * {
          transition-duration: 1ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Optimized theme application with smooth transitions
const withSmoothTransition = (callback: () => void) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Add transition class
    root.classList.add('theme-changing');
    
    // Apply theme changes
    requestAnimationFrame(() => {
      callback();
      
      // Remove transition class after animation completes
      setTimeout(() => {
        root.classList.remove('theme-changing');
      }, 400);
    });
  } else {
    callback();
  }
};

// Theme detection and system preference handling
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const mediaQueryRef = useRef<MediaQueryList | null>(null);

  // Initialize theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
    setMounted(true);
  }, []);

  // Apply theme with smooth transitions
  const applyTheme = useCallback((themeToApply: Theme) => {
    if (!mounted) return;

    setIsChanging(true);
    
    withSmoothTransition(() => {
      const root = document.documentElement;
      const sparkApp = document.getElementById('spark-app');
      
      let actualTheme = themeToApply;
      if (themeToApply === 'system') {
        actualTheme = getSystemTheme();
      }

      if (actualTheme === 'dark') {
        root.classList.add('dark');
        sparkApp?.classList.add('dark-theme');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        sparkApp?.classList.remove('dark-theme');
        root.style.colorScheme = 'light';
      }
    });

    localStorage.setItem('theme', themeToApply);
    
    setTimeout(() => setIsChanging(false), 400);
  }, [mounted]);

  // Initialize styles and apply theme
  useEffect(() => {
    if (mounted) {
      addTransitionStyles();
      applyTheme(theme);
    }
  }, [theme, applyTheme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryRef.current = mediaQuery;

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme, mounted]);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    if (isChanging) return; // Prevent rapid theme changes
    setTheme(newTheme);
  }, [isChanging]);

  const getIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  };

  const Icon = getIcon();
  const effectiveTheme = getEffectiveTheme();

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 rounded-xl opacity-50"
        disabled
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 w-10 rounded-xl transition-all duration-200 group relative overflow-hidden",
            "hover:bg-accent/10 hover:scale-105 active:scale-95",
            "shadow-sm hover:shadow-md",
            "glass-effect border border-border/40 hover:border-accent/30",
            isChanging && "animate-pulse"
          )}
          aria-label={`Current theme: ${theme}. Click to change theme`}
          disabled={isChanging}
        >
          <Icon className={cn(
            "h-4 w-4 transition-all duration-200",
            "group-hover:scale-110 group-hover:rotate-12",
            isChanging && "animate-spin"
          )} />
          
          {/* Theme indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background transition-colors duration-200",
            effectiveTheme === 'dark' ? 'bg-slate-800' : 'bg-amber-400'
          )} />

          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 glass-effect-strong border-border/60 shadow-xl"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="opacity-60" />
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className={cn(
            "gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200",
            "hover:bg-accent/10 focus:bg-accent/10",
            theme === 'light' && "bg-accent/20 text-accent-foreground"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Light</div>
            <div className="text-xs text-muted-foreground">Bright and clean</div>
          </div>
          {theme === 'light' && (
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className={cn(
            "gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200",
            "hover:bg-accent/10 focus:bg-accent/10",
            theme === 'dark' && "bg-accent/20 text-accent-foreground"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Dark</div>
            <div className="text-xs text-muted-foreground">Easy on the eyes</div>
          </div>
          {theme === 'dark' && (
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className={cn(
            "gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200",
            "hover:bg-accent/10 focus:bg-accent/10",
            theme === 'system' && "bg-accent/20 text-accent-foreground"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium">System</div>
            <div className="text-xs text-muted-foreground">
              Follows device setting ({effectiveTheme})
            </div>
          </div>
          {theme === 'system' && (
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact toggle for mobile or space-constrained layouts
export function CompactThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const Icon = getIcon();

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg opacity-50" disabled>
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "h-8 w-8 rounded-lg transition-all duration-200 group",
        "hover:bg-accent/10 hover:scale-105 active:scale-95"
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
    </Button>
  );
}

// Theme provider for app-wide theme management
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    addTransitionStyles();
  }, []);

  return <>{children}</>;
}
