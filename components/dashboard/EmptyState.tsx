import { FileText, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface EmptyStateProps {
  type: 'notes' | 'search' | 'workspace';
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const content = {
    notes: {
      icon: FileText,
      title: 'No notes yet',
      description: 'Start by creating your first note to organize your thoughts and ideas.',
      defaultAction: 'Create Note'
    },
    search: {
      icon: FileText,
      title: 'No results found',
      description: 'Try adjusting your search terms or browse all notes.',
      defaultAction: 'Clear Search'
    },
    workspace: {
      icon: FileText,
      title: 'Empty workspace',
      description: 'This workspace is empty. Add some notes to get started.',
      defaultAction: 'Add Note'
    }
  };

  const config = content[type];
  const Icon = config.icon;

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{config.description}</p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel || config.defaultAction}
        </Button>
      )}
    </Card>
  );
}
