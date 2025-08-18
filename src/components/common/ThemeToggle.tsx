import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const sparkApp = document.getElementById('spark-app');

    if (theme === 'dark') {
      root.classList.add('dark');
      sparkApp?.classList.add('dark-theme');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      sparkApp?.classList.remove('dark-theme');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        sparkApp?.classList.add('dark-theme');
      } else {
        root.classList.remove('dark');
        sparkApp?.classList.remove('dark-theme');
      }
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = document.documentElement;
        const sparkApp = document.getElementById('spark-app');
        
        if (mediaQuery.matches) {
          root.classList.add('dark');
          sparkApp?.classList.add('dark-theme');
        } else {
          root.classList.remove('dark');
          sparkApp?.classList.remove('dark-theme');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

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
          className="h-9 w-9 rounded-md"
          aria-label="Toggle theme"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="gap-2"
        >
          <Sun className="h-4 w-4" />
          Light
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="gap-2"
        >
          <Moon className="h-4 w-4" />
          Dark
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          System
          {theme === 'system' && <span className="ml-auto">✓</span>}
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
