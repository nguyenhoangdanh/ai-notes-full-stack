/**
 * Performance optimization utilities for the AI Notes application
 * Includes debouncing, throttling, memoization, and animation helpers
 */

// Debounce function for search inputs and resize handlers
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

// Throttle function for scroll handlers and frequent events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

// Lazy loading helper for images
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// RAF-based animation helper
export function animate(
  callback: (progress: number) => void,
  duration: number,
  easing: (t: number) => number = (t) => t
): () => void {
  const startTime = performance.now();
  let rafId: number;
  
  const frame = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    
    callback(easedProgress);
    
    if (progress < 1) {
      rafId = requestAnimationFrame(frame);
    }
  };
  
  rafId = requestAnimationFrame(frame);
  
  // Return cancel function
  return () => cancelAnimationFrame(rafId);
}

// Easing functions for smooth animations
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeInBounce: (t: number) => 1 - easings.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  easeInOutBounce: (t: number) => t < 0.5 
    ? easings.easeInBounce(t * 2) * 0.5 
    : easings.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }
  
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof performance === 'undefined') return null;
    
    try {
      const measurement = performance.measure(name, startMark, endMark);
      const duration = measurement.duration;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const values = this.metrics.get(name)!;
      values.push(duration);
      
      // Keep only last 100 measurements
      if (values.length > 100) {
        values.shift();
      }
      
      return duration;
    } catch (error) {
      console.warn(`Performance measurement failed for ${name}:`, error);
      return null;
    }
  }
  
  getAverageTime(name: string): number | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;
    
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

// Virtualization helper for large lists
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan = 5
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(itemCount - 1, start + visibleCount + overscan * 2);
  
  return { start, end };
}

// Bundle splitting helper
export function loadComponentAsync<T>(
  importFunction: () => Promise<{ default: T }>
): Promise<T> {
  return importFunction().then(module => module.default);
}

// Memory usage monitoring
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory;
  }
  return null;
}

// CSS containment helper
export function applyContainment(element: HTMLElement, types: string[] = ['layout', 'style']): void {
  if ('CSS' in window && 'supports' in CSS) {
    const containValue = types.join(' ');
    if (CSS.supports('contain', containValue)) {
      element.style.contain = containValue;
    }
  }
}

// Web Worker helper for heavy computations
export function createWorkerTask<T, R>(
  workerScript: string,
  data: T
): Promise<R> {
  return new Promise((resolve, reject) => {
    if (typeof Worker === 'undefined') {
      reject(new Error('Web Workers not supported'));
      return;
    }
    
    const worker = new Worker(workerScript);
    
    worker.onmessage = (event) => {
      resolve(event.data);
      worker.terminate();
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
    
    worker.postMessage(data);
  });
}

// Preload critical resources
export function preloadResource(href: string, as: string, crossorigin?: string): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }
  
  document.head.appendChild(link);
}

// Critical CSS inlining helper
export function inlineCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  
  document.head.insertBefore(style, document.head.firstChild);
}

// Resource hints
export function addResourceHints(urls: string[], rel: 'dns-prefetch' | 'preconnect' = 'dns-prefetch'): void {
  if (typeof document === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = url;
    document.head.appendChild(link);
  });
}

// Performance-aware setTimeout
export function performanceTimeout(callback: () => void, delay: number): number {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(() => {
      setTimeout(callback, delay);
    }) as any;
  }
  
  return setTimeout(callback, delay) as any;
}

// FPS monitoring
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private rafId?: number;
  
  start(callback?: (fps: number) => void): void {
    const measure = (currentTime: number) => {
      this.frames.push(currentTime);
      
      // Keep only last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }
      
      if (this.frames.length >= 2) {
        const fps = Math.round(
          (this.frames.length - 1) / 
          ((this.frames[this.frames.length - 1] - this.frames[0]) / 1000)
        );
        
        callback?.(fps);
      }
      
      this.rafId = requestAnimationFrame(measure);
    };
    
    this.rafId = requestAnimationFrame(measure);
  }
  
  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    this.frames = [];
  }
  
  getAverageFPS(): number {
    if (this.frames.length < 2) return 0;
    
    return Math.round(
      (this.frames.length - 1) / 
      ((this.frames[this.frames.length - 1] - this.frames[0]) / 1000)
    );
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const fpsMonitor = new FPSMonitor();
