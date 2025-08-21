import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Merge, FileText, Calendar, AlertTriangle } from 'lucide-react'

interface MergeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: any
  onMerge: (group: any, targetNoteId: string) => Promise<void>
  isLoading: boolean
}

export function MergeDialog({
  open,
  onOpenChange,
  group,
  onMerge,
  isLoading,
}: MergeDialogProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('')

  const handleMerge = async () => {
    if (!selectedTargetId) return
    
    try {
      await onMerge(group, selectedTargetId)
    } catch (error) {
      console.error('Failed to merge:', error)
    }
  }

  if (!group) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" />
            Merge Duplicate Notes
          </DialogTitle>
          <DialogDescription>
            Select which note should be kept as the primary note. All other notes will be merged into it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800">Important</h4>
                <p className="text-sm text-orange-700">
                  This action cannot be undone. The selected note will be preserved, and all others will be deleted after merging their content.
                </p>
              </div>
            </div>
          </div>

          {/* Note Selection */}
          <div className="flex-1 overflow-y-auto">
            <RadioGroup value={selectedTargetId} onValueChange={setSelectedTargetId}>
              <div className="space-y-3">
                {group.notes.map((note: any, index: number) => (
                  <div key={note.id} className="relative">
                    <Label
                      htmlFor={note.id}
                      className="cursor-pointer block"
                    >
                      <Card className={`transition-colors hover:bg-muted/50 ${
                        selectedTargetId === note.id ? 'ring-2 ring-primary' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem 
                              value={note.id} 
                              id={note.id}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium truncate">{note.title}</h4>
                                {index === 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {note.content.substring(0, 200)}...
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {note.content.length} chars
                                </div>
                                {note.wordCount && (
                                  <span>{note.wordCount} words</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Preview */}
          {selectedTargetId && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h5 className="text-sm font-medium mb-2">Merge Preview</h5>
              <p className="text-xs text-muted-foreground">
                The selected note will be preserved. Content from {group.notes.length - 1} other note(s) will be appended to it.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleMerge}
            disabled={isLoading || !selectedTargetId}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Merging...' : 'Merge Notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
