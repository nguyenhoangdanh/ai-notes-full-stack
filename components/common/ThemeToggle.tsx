'use client'

import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

type Theme = 'light' | 'dark' | 'system';

// Add smooth transition styles
const addTransitionStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        color-scheme: light;
        transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                   color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      :root.dark {
        color-scheme: dark;
      }

      * {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                   border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                   color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                   box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-effect {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                   backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                   border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .theme-transition-disable * {
        transition: none !important;
      }

      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Temporarily disable transitions during theme change to prevent flash
const withTransition = (callback: () => void) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('theme-transition-disable');
    callback();
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition-disable');
    }, 100);
  } else {
    callback();
  }
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  const applyTheme = useCallback((themeToApply: Theme) => {
    withTransition(() => {
      const root = document.documentElement;
      const sparkApp = document.getElementById('spark-app');

      if (themeToApply === 'dark') {
        root.classList.add('dark');
        sparkApp?.classList.add('dark-theme');
        root.style.colorScheme = 'dark';
      } else if (themeToApply === 'light') {
        root.classList.remove('dark');
        sparkApp?.classList.remove('dark-theme');
        root.style.colorScheme = 'light';
      } else {
        // System theme
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.add('dark');
          sparkApp?.classList.add('dark-theme');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          sparkApp?.classList.remove('dark-theme');
          root.style.colorScheme = 'light';
        }
      }
    });

    localStorage.setItem('theme', themeToApply);
  }, []);

  useEffect(() => {
    addTransitionStyles();
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const getIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const Icon = getIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-xl hover:bg-accent/80 hover:scale-105 transition-all duration-200 group shadow-sm hover:shadow-md"
          aria-label={`Current theme: ${theme}. Click to change theme`}
        >
          <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2 bg-background/95 backdrop-blur-md border-border/60">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            "gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200",
            theme === 'light' && "bg-primary/10 text-primary"
          )}
        >
          <Sun className="h-4 w-4" />
          <span className="flex-1">Light</span>
          {theme === 'light' && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            "gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200",
            theme === 'dark' && "bg-primary/10 text-primary"
          )}
        >
          <Moon className="h-4 w-4" />
          <span className="flex-1">Dark</span>
          {theme === 'dark' && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            "gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200",
            theme === 'system' && "bg-primary/10 text-primary"
          )}
        >
          <Monitor className="h-4 w-4" />
          <span className="flex-1">System</span>
          {theme === 'system' && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile or tight spaces
export function CompactThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
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

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-md"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
