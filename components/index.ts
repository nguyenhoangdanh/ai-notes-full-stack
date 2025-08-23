// Layout Components
export { AppLayout } from './layout/AppLayout'
export { Header } from './layout/Header'
export { Sidebar } from './layout/Sidebar'

// UI Components
export { Button } from './ui/Button'
export { Input } from './ui/input'
export { Textarea } from './ui/textarea'
export { Card, CardHeader, CardContent, CardFooter, FeatureCard, MetricCard, ActionCard } from './ui/Card'
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from './ui/dialog'
export { Badge, AIBadge, SuccessBadge, WarningBadge, DangerBadge, CountBadge, StatusBadge } from './ui/Badge'
export { Separator } from './ui/separator'
export { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'
export { Label } from './ui/label'

// Form Components
export { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage,
  useFormField 
} from './ui/form'

// Mobile Components
export { MobileButton, mobileButtonVariants } from './ui/mobile-button'

// Common Components
export { ThemeToggle, CompactThemeToggle } from './common/ThemeToggle'
export { ResponsiveContainer } from './common/ResponsiveContainer'
export { ResponsiveGrid } from './common/ResponsiveGrid'

// Dashboard Components
export { DashboardOverview } from './dashboard/DashboardOverview'
export { Dashboard } from './dashboard/Dashboard'

// Accessibility Components
export { 
  SkipLinks,
  ScreenReaderOnly,
  FocusTrap,
  LiveRegion,
  LoadingIndicator,
  AccessibleError,
  keyboardHelpers,
  useHighContrastMode,
  useReducedMotion,
  useAnnounce,
  useRovingTabindex
} from './accessibility/A11y'

// Auth Components
export { AuthScreen } from './auth/AuthScreen'

// AI Components
export { AIAssistantToggle } from './ai/AIAssistantToggle'
export { AIChatInterface } from './ai/AIChatInterface'

// Mobile Components
export { MobileDashboard } from './mobile/MobileDashboard'
export { VoiceNoteRecorder } from './mobile/VoiceNoteRecorder'

// Types
export type { InputProps } from './ui/input'
export type { TextareaProps } from './ui/textarea'
export type { MobileButtonProps } from './ui/mobile-button'
