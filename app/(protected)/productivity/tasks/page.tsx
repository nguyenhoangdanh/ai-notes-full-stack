'use client'
import { Badge, Button, Card, CardContent, CardHeader, Input } from '@/components'
import { CardTitle } from '@/components/ui'
import { CheckCircle, Clock, Plus } from 'lucide-react'
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/use-productivity'
import { useState } from 'react'
import { toast } from 'sonner'

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const [newTask, setNewTask] = useState('')

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        await createTaskMutation.mutateAsync({
          title: newTask,
          description: '',
          priority: 'MEDIUM',
          status: 'TODO'
        })
        setNewTask('')
      } catch (error) {
        // Error handled by mutation
      }
    }
  }

  const handleToggleTask = async (task: any) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: {
          status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
        }
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/2 relative overflow-hidden">
      {/* Superhuman background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-2" />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Superhuman Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Tasks</h1>
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">Manage your tasks and to-dos</p>
          </div>
          <Button 
            size="lg" 
            className="gap-2 rounded-full superhuman-gradient superhuman-glow px-6 py-3"
            onClick={handleAddTask}
            disabled={createTaskMutation.isPending}
          >
            <Plus className="h-5 w-5" />
            {createTaskMutation.isPending ? 'Creating...' : 'New Task'}
          </Button>
        </div>

        <Card variant="glass" className="border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="What needs to be done?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 bg-background/50 border-border/30"
              />
              <Button onClick={handleAddTask} className="rounded-full">Add</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Your Tasks
          </h2>
          <div className="grid gap-3">
            {tasks.map((task: any, index: number) => (
              <Card 
                key={task.id} 
                variant="glass" 
                className={`group cursor-pointer superhuman-hover border-border/30 animate-superhuman-fade-in ${
                  task.status === 'COMPLETED' ? 'opacity-75' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleToggleTask(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle 
                      className={`h-5 w-5 transition-colors ${
                        task.status === 'COMPLETED' ? 'text-green-500 fill-green-500' : 'text-muted-foreground hover:text-green-500'
                      }`} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : 'group-hover:text-primary'} superhuman-transition`}>
                          {task.title}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs rounded-full capitalize ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
