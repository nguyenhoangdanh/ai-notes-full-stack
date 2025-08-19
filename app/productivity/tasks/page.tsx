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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks and to-dos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle 
                  className={`h-5 w-5 ${task.completed ? 'text-green-500' : 'text-gray-300'}`} 
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Due {task.dueDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}