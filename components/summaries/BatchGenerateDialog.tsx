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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { FileText, Calendar } from 'lucide-react'
import { type Note } from '@/types'

interface BatchGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notes: Note[]
  onSubmit: (noteIds: string[], options: any) => Promise<void>
  isLoading: boolean
}

export function BatchGenerateDialog({
  open,
  onOpenChange,
  notes,
  onSubmit,
  isLoading,
}: BatchGenerateDialogProps) {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [options, setOptions] = useState({
    minWords: 50,
    maxWords: 200,
    includeKeywords: true,
  })

  const toggleNote = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    )
  }

  const selectAll = () => {
    setSelectedNotes(notes.map(note => note.id))
  }

  const clearAll = () => {
    setSelectedNotes([])
  }

  const handleSubmit = async () => {
    if (selectedNotes.length === 0) return
    
    try {
      await onSubmit(selectedNotes, options)
    } catch (error) {
      console.error('Failed to generate summaries:', error)
    }
  }

  // Filter notes that don't have summaries (for now, show all notes)
  const notesWithoutSummaries = notes

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Batch Generate Summaries</DialogTitle>
          <DialogDescription>
            Select notes to generate AI summaries for
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All ({notesWithoutSummaries.length})
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <Badge variant="secondary">
              {selectedNotes.length} selected
            </Badge>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
            {notesWithoutSummaries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">
                    All notes already have summaries
                  </p>
                </CardContent>
              </Card>
            ) : (
              notesWithoutSummaries.map((note) => (
                <Card key={note.id} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedNotes.includes(note.id)}
                        onCheckedChange={() => toggleNote(note.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{note.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(note.createdAt).toLocaleDateString()}
                          <span>•</span>
                          <span>{note.content?.length || 0} chars</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Options */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Generation Options</Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label htmlFor="minWords">Min Words: {options.minWords}</Label>
                <input
                  id="minWords"
                  type="range"
                  min="25"
                  max="100"
                  value={options.minWords}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    minWords: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="maxWords">Max Words: {options.maxWords}</Label>
                <input
                  id="maxWords"
                  type="range"
                  min="100"
                  max="500"
                  value={options.maxWords}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    maxWords: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="keywords"
                checked={options.includeKeywords}
                onCheckedChange={(checked) => setOptions(prev => ({ 
                  ...prev, 
                  includeKeywords: checked === true 
                }))}
              />
              <Label htmlFor="keywords" className="text-sm">Include keywords</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || selectedNotes.length === 0}
          >
            {isLoading ? 'Generating...' : `Generate ${selectedNotes.length} Summaries`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
