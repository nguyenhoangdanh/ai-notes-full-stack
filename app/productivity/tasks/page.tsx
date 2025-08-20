'use client'
import { CheckCircle, Clock, Plus } from 'lucide-react'

import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'

export default function TasksPage() {
  const [tasks] = useState([
    { id: '1', title: 'Review notes from meeting', completed: false, priority: 'high', dueDate: '2024-01-15' },
    { id: '2', title: 'Organize workspace files', completed: true, priority: 'medium', dueDate: '2024-01-14' },
    { id: '3', title: 'Write project summary', completed: false, priority: 'low', dueDate: '2024-01-16' }
  ])
  const [newTask, setNewTask] = useState('')

  const handleAddTask = () => {
    if (newTask.trim()) {
      console.log('Adding task:', newTask)
      setNewTask('')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
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
          <Button size="lg" className="gap-2 rounded-full superhuman-gradient superhuman-glow px-6 py-3">
            <Plus className="h-5 w-5" />
            New Task
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
            {tasks.map((task, index) => (
              <Card 
                key={task.id} 
                variant="glass" 
                className={`group cursor-pointer superhuman-hover border-border/30 animate-superhuman-fade-in ${
                  task.completed ? 'opacity-75' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle 
                      className={`h-5 w-5 transition-colors ${
                        task.completed ? 'text-green-500 fill-green-500' : 'text-muted-foreground hover:text-green-500'
                      }`} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'group-hover:text-primary'} superhuman-transition`}>
                          {task.title}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs rounded-full capitalize ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
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