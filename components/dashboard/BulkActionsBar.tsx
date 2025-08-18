import { useState } from 'react';
import { Trash2, Archive, Tag, Share2, Download, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedNoteIds: string[];
  onDelete: (noteIds: string[]) => void;
  onArchive?: (noteIds: string[]) => void;
  onTag?: (noteIds: string[], tagId: string) => void;
  onShare?: (noteIds: string[]) => void;
  onExport?: (noteIds: string[]) => void;
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  selectedNoteIds,
  onDelete,
  onArchive,
  onTag,
  onShare,
  onExport,
  onClear
}: BulkActionsBarProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void> | void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 p-4 shadow-lg border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedCount} selected</Badge>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-2">
          {onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onArchive(selectedNoteIds))}
              disabled={isLoading}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}
          
          {onTag && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onTag && onTag(selectedNoteIds, ''))}
              disabled={isLoading}
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              Tag
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onShare(selectedNoteIds))}
              disabled={isLoading}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
          
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onExport(selectedNoteIds))}
              disabled={isLoading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(() => onDelete(selectedNoteIds))}
            disabled={isLoading}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="gap-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
