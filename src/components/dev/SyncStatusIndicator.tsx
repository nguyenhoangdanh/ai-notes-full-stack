import { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, Cloud, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { syncService, SyncStatus } from '../../lib/sync-service';

export function SyncStatusIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingOperations: 0,
    failedOperations: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    };

    updateStatus();
    const unsubscribe = syncService.addSyncListener(setSyncStatus);

    return unsubscribe;
  }, []);

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return WifiOff;
    if (syncStatus.isSyncing) return Cloud;
    if (syncStatus.failedOperations > 0) return AlertCircle;
    if (syncStatus.pendingOperations > 0) return CloudOff;
    return CheckCircle;
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'destructive';
    if (syncStatus.isSyncing) return 'default';
    if (syncStatus.failedOperations > 0) return 'destructive';
    if (syncStatus.pendingOperations > 0) return 'secondary';
    return 'secondary';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.failedOperations > 0) return 'Sync Failed';
    if (syncStatus.pendingOperations > 0) return 'Pending';
    return 'Offline Mode';
  };

  const StatusIcon = getStatusIcon();
  const syncEnabled = import.meta.env.VITE_ENABLE_SYNC !== 'false';
  const hasBackend = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
          >
            <StatusIcon className="h-4 w-4" />
            <Badge variant={getStatusColor() as any} className="text-xs">
              {getStatusText()}
            </Badge>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80 bg-background/95 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <StatusIcon className="h-4 w-4" />
                Sync Status
              </CardTitle>
              <CardDescription className="text-xs">
                Current synchronization state
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {syncStatus.isOnline ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span>Network: {syncStatus.isOnline ? 'Online' : 'Offline'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {syncEnabled ? (
                    <Cloud className="h-3 w-3 text-blue-500" />
                  ) : (
                    <CloudOff className="h-3 w-3 text-gray-500" />
                  )}
                  <span>Sync: {syncEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>Pending: {syncStatus.pendingOperations}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Failed: {syncStatus.failedOperations}</span>
                </div>
              </div>

              {syncStatus.lastSyncTime && (
                <div className="text-xs text-muted-foreground">
                  Last sync: {syncStatus.lastSyncTime.toLocaleString()}
                </div>
              )}

              {!hasBackend && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-800 dark:text-amber-200">
                      <div className="font-medium">Running in offline mode</div>
                      <div className="text-amber-700 dark:text-amber-300">
                        No backend server configured. All data is stored locally.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasBackend && syncStatus.failedOperations > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-800 dark:text-red-200">
                      <div className="font-medium">Sync issues detected</div>
                      <div className="text-red-700 dark:text-red-300">
                        Backend server may be unavailable.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => syncService.forcSync().catch(() => {})}
                  disabled={!syncStatus.isOnline || !syncEnabled || syncStatus.isSyncing}
                  className="text-xs h-7"
                >
                  Force Sync
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs h-7"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
