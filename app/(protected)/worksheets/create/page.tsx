'use client'

import { ArrowLeft, Plus, Calendar, Users, Factory, Target, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCreateWorksheet } from '@/hooks/use-worksheet'
import { useFactories, useGroups, useProducts, useProcesses } from '@/hooks/use-worksheet'
import { toast } from 'sonner'
import type { CreateWorksheetDto, ShiftType } from '@/types/worksheet.types'

interface WorksheetFormData {
  groupId: string
  date: Date
  shiftType: ShiftType
  productId: string
  processId: string
  targetOutputPerHour: number
}

export default function CreateWorksheetPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Form handling
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<WorksheetFormData>({
    defaultValues: {
      date: new Date(),
      targetOutputPerHour: 50
    }
  })

  // Data fetching
  const { data: factories = [] } = useFactories()
  const { data: groups = [] } = useGroups()
  const { data: products = [] } = useProducts()
  const { data: processes = [] } = useProcesses()

  // Mutations
  const createWorksheet = useCreateWorksheet()

  // Watch for form changes
  const selectedGroupId = watch('groupId')
  const selectedProductId = watch('productId')
  const selectedProcessId = watch('processId')

  // Filter groups by factory if needed
  const availableGroups = groups // In real app, filter by selected factory

  const shiftTypes: { value: ShiftType; label: string; hours: number; description: string }[] = [
    { value: 'NORMAL_8H', label: '8 Hour Shift', hours: 8, description: 'Standard 8-hour production shift' },
    { value: 'EXTENDED_9_5H', label: '9.5 Hour Shift', hours: 9.5, description: 'Extended shift with breaks' },
    { value: 'OVERTIME_11H', label: '11 Hour Shift', hours: 11, description: 'Overtime shift with premium pay' }
  ]

  const onSubmit = async (data: WorksheetFormData) => {
    setIsSubmitting(true)
    
    try {
      const worksheetData: CreateWorksheetDto = {
        groupId: data.groupId,
        date: format(data.date, 'yyyy-MM-dd'),
        shiftType: data.shiftType,
        productId: data.productId,
        processId: data.processId,
        targetOutputPerHour: data.targetOutputPerHour
      }

      const result = await createWorksheet.mutateAsync(worksheetData)
      
      toast.success('Worksheet created successfully!')
      router.push(`/worksheets/${result.id}`)
      
    } catch (error) {
      toast.error('Failed to create worksheet')
      console.error('Create worksheet error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setValue('date', date)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Worksheet</h1>
          <p className="text-muted-foreground">Set up a new production worksheet for your team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Worksheet Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              {/* Group Selection */}
              <div className="space-y-2">
                <Label htmlFor="groupId">Production Group</Label>
                <Select 
                  value={selectedGroupId} 
                  onValueChange={(value) => setValue('groupId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select production group" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-muted-foreground">{group.code}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.groupId && (
                  <p className="text-sm text-destructive">{errors.groupId.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shift Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Shift Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Shift Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shiftTypes.map((shift) => (
                  <Card 
                    key={shift.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      watch('shiftType') === shift.value 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setValue('shiftType', shift.value)}
                  >
                    <CardContent className="p-4 text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">{shift.label}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{shift.hours} hours</p>
                      <p className="text-xs text-muted-foreground">{shift.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Production Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="productId">Product</Label>
                <Select 
                  value={selectedProductId} 
                  onValueChange={(value) => setValue('productId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.code}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && (
                  <p className="text-sm text-destructive">{errors.productId.message}</p>
                )}
              </div>

              {/* Process Selection */}
              <div className="space-y-2">
                <Label htmlFor="processId">Process</Label>
                <Select 
                  value={selectedProcessId} 
                  onValueChange={(value) => setValue('processId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        <div>
                          <div className="font-medium">{process.name}</div>
                          <div className="text-sm text-muted-foreground">{process.code}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.processId && (
                  <p className="text-sm text-destructive">{errors.processId.message}</p>
                )}
              </div>

              {/* Target Output */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="targetOutputPerHour">Target Output Per Hour</Label>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetOutputPerHour"
                    type="number"
                    min="1"
                    max="1000"
                    {...register('targetOutputPerHour', {
                      required: 'Target output is required',
                      min: { value: 1, message: 'Target must be at least 1' },
                      max: { value: 1000, message: 'Target cannot exceed 1000' }
                    })}
                    placeholder="Enter target units per hour"
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">units/hour</span>
                </div>
                {errors.targetOutputPerHour && (
                  <p className="text-sm text-destructive">{errors.targetOutputPerHour.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedGroupId && watch('shiftType') && selectedProductId && selectedProcessId && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                Worksheet Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(selectedDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group:</span>
                    <span className="font-medium">
                      {availableGroups.find(g => g.id === selectedGroupId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shift:</span>
                    <span className="font-medium">
                      {shiftTypes.find(s => s.value === watch('shiftType'))?.label}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">
                      {products.find(p => p.id === selectedProductId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Process:</span>
                    <span className="font-medium">
                      {processes.find(p => p.id === selectedProcessId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium">{watch('targetOutputPerHour')} units/hour</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              'Creating...'
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Worksheet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
