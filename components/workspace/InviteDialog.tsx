import { useState } from 'react';
import { UserPlus, Mail, Send, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
}

type Permission = 'read' | 'write' | 'admin';

export function InviteDialog({ open, onOpenChange, workspaceId, workspaceName }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('write');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      // This would integrate with the actual invite hook when collaboration is implemented
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteLink = async () => {
    setIsLoading(true);
    try {
      // Mock invite link generation
      const mockLink = `https://app.ai-notes.com/invite/${workspaceId}?token=abc123`;
      setInviteLink(mockLink);
      toast.success('Invite link generated');
    } catch (error) {
      toast.error('Failed to generate invite link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const permissionLabels = {
    read: 'Can view notes',
    write: 'Can view and edit notes',
    admin: 'Full access including settings'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite to {workspaceName}
          </DialogTitle>
          <DialogDescription>
            Invite team members to collaborate on this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Invitation */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Send email invitation
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="permission-select">Permission level</Label>
                  <Select value={permission} onValueChange={(value: Permission) => setPermission(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">
                        <div>
                          <div className="font-medium">Read only</div>
                          <div className="text-xs text-muted-foreground">{permissionLabels.read}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="write">
                        <div>
                          <div className="font-medium">Editor</div>
                          <div className="text-xs text-muted-foreground">{permissionLabels.write}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div>
                          <div className="font-medium">Admin</div>
                          <div className="text-xs text-muted-foreground">{permissionLabels.admin}</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleInvite} disabled={isLoading} className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invite Link */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-sm font-medium">Share invite link</div>
              
              {!inviteLink ? (
                <Button 
                  variant="outline" 
                  onClick={generateInviteLink} 
                  disabled={isLoading}
                  className="w-full"
                >
                  Generate Invite Link
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value={inviteLink}
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyInviteLink}
                      className="gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {permission} access
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Link expires in 7 days
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground text-center">
            💡 Collaboration features are coming soon. This is a preview of the invite system.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
