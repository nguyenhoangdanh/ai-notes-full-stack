import { useState } from 'react';
import { Settings, Users, Shield, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useWorkspaces, useUpdateWorkspace, useDeleteWorkspace } from '../../hooks/use-workspaces';
import { toast } from 'sonner';

interface WorkspaceSettingsPanelProps {
  workspaceId: string;
  onClose?: () => void;
}

export function WorkspaceSettingsPanel({ workspaceId, onClose }: WorkspaceSettingsPanelProps) {
  const { data: workspaces } = useWorkspaces();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  
  // Find the specific workspace from the list
  const workspace = workspaces?.find(w => w.id === workspaceId);
  
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    privacy: workspace?.privacy || 'private'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateWorkspace.mutateAsync({
        id: workspaceId,
        data: formData
      });
      toast.success('Workspace updated successfully');
      onClose?.();
    } catch (error) {
      toast.error('Failed to update workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWorkspace.mutateAsync(workspaceId);
      toast.success('Workspace deleted');
      onClose?.();
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Workspace Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Manage basic workspace information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Workspace name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description</Label>
            <Textarea
              id="workspace-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this workspace"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workspace-privacy">Privacy</Label>
            <Select 
              value={formData.privacy} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, privacy: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Private
                  </div>
                </SelectItem>
                <SelectItem value="shared">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Shared
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
          <CardDescription>Manage workspace access and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">You</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
              <Badge>Owner</Badge>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Collaboration features coming soon. You'll be able to invite team members and manage permissions.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Workspace
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All notes in this workspace will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
