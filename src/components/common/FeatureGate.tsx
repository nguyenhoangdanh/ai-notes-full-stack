import { ReactNode } from 'react';
import { useFeatures } from '../../hooks/use-features';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function FeatureGate({ feature, children, fallback = null, className }: FeatureGateProps) {
  // For now, we'll use a simple feature flag system
  // This would integrate with the actual feature flags when available
  const featureFlags = {
    'ai-assistant': true,
    'collaboration': false,
    'voice-notes': true,
    'semantic-search': true,
    'pomodoro': true,
    'task-management': true,
    'calendar-integration': false,
    'export-advanced': true,
    'templates': true,
    'analytics': false,
    'mobile-pwa': true,
    'offline-sync': true
  };

  const isEnabled = featureFlags[feature as keyof typeof featureFlags] ?? false;

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <div className={className}>{children}</div>;
}

interface FeatureGateHookProps {
  feature: string;
  onEnabled?: () => ReactNode;
  onDisabled?: () => ReactNode;
}

export function useFeatureGate(feature: string): boolean {
  const featureFlags = {
    'ai-assistant': true,
    'collaboration': false,
    'voice-notes': true,
    'semantic-search': true,
    'pomodoro': true,
    'task-management': true,
    'calendar-integration': false,
    'export-advanced': true,
    'templates': true,
    'analytics': false,
    'mobile-pwa': true,
    'offline-sync': true
  };

  return featureFlags[feature as keyof typeof featureFlags] ?? false;
}
