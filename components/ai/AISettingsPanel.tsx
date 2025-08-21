import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/Badge'
import { Separator } from '../ui/separator'
import { 
  Brain, 
  Sparkle, 
  Settings, 
  Zap,
  Clock,
  Shield,
  BarChart3,
  Bot,
  MessageSquare
} from 'lucide-react'
import { useAI } from '../../contexts/AIContext'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface AISettingsPanelProps {
  className?: string
}

export function AISettingsPanel({ className }: AISettingsPanelProps) {
  const { 
    conversations 
  } = useAI()
  
  const [aiModel, setAIModel] = useState('gpt-4-turbo')
  const [autoSuggest, setAutoSuggest] = useState(true)
  const [responsiveness, setResponsiveness] = useState(3) // 1-5 scale
  const [creativity, setCreativity] = useState(3) // 1-5 scale
  const [autoSummarize, setAutoSummarize] = useState(true)
  const [contextAwareness, setContextAwareness] = useState(true)
  const [smartNotifications, setSmartNotifications] = useState(false)

  const handleModelChange = (newModel: string) => {
    setAIModel(newModel)
    toast.success(`AI model changed to ${newModel}`)
  }

  const getModelDescription = (model: string) => {
    switch (model) {
      case 'gpt-4o':
        return 'Most capable model for complex tasks'
      case 'gpt-4o-mini':
        return 'Faster and more efficient for simple tasks'
      default:
        return 'Advanced language model'
    }
  }

  const getUsageStats = () => {
    const totalMessages = conversations.reduce((total, conv) => total + conv.messages.length, 0)
    const totalConversations = conversations.length
    const avgMessagesPerConv = totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0
    
    return { totalMessages, totalConversations, avgMessagesPerConv }
  }

  const stats = getUsageStats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">AI Settings</h2>
          <p className="text-sm text-muted-foreground">Configure your AI assistant behavior</p>
        </div>
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Usage Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalConversations}</div>
              <div className="text-xs text-muted-foreground">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.totalMessages}</div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-foreground">{stats.avgMessagesPerConv}</div>
              <div className="text-xs text-muted-foreground">Avg per chat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span>AI Model</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Model</label>
            <Select value={aiModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">
                  <div className="flex items-center space-x-2">
                    <span>GPT-4o</span>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="gpt-4o-mini">
                  <div className="flex items-center space-x-2">
                    <span>GPT-4o Mini</span>
                    <Badge variant="outline" className="text-xs">Fast</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getModelDescription(aiModel)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>AI Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Suggestions */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Auto Suggestions</label>
              <p className="text-xs text-muted-foreground">
                Automatically suggest improvements while editing
              </p>
            </div>
            <Switch
              checked={autoSuggest}
              onCheckedChange={setAutoSuggest}
            />
          </div>

          <Separator />

          {/* Auto Summarize */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Auto Summarize</label>
              <p className="text-xs text-muted-foreground">
                Generate summaries for long notes automatically
              </p>
            </div>
            <Switch
              checked={autoSummarize}
              onCheckedChange={setAutoSummarize}
            />
          </div>

          <Separator />

          {/* Context Awareness */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Context Awareness</label>
              <p className="text-xs text-muted-foreground">
                Use related notes to provide better suggestions
              </p>
            </div>
            <Switch
              checked={contextAwareness}
              onCheckedChange={setContextAwareness}
            />
          </div>

          <Separator />

          {/* Smart Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Smart Notifications</label>
              <p className="text-xs text-muted-foreground">
                Get AI-powered reminders and insights
              </p>
            </div>
            <Switch
              checked={smartNotifications}
              onCheckedChange={setSmartNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Personality */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Sparkle className="h-4 w-4" />
            <span>AI Personality</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Responsiveness */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Response Speed</label>
              <Badge variant="outline" className="text-xs">
                {responsiveness === 1 ? 'Slow & Thoughtful' :
                 responsiveness === 2 ? 'Deliberate' :
                 responsiveness === 3 ? 'Balanced' :
                 responsiveness === 4 ? 'Quick' : 'Lightning Fast'}
              </Badge>
            </div>
            <Slider
              value={[responsiveness]}
              onValueChange={(value) => setResponsiveness(value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controls how quickly the AI responds vs. how thorough the analysis is
            </p>
          </div>

          <Separator />

          {/* Creativity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Creativity Level</label>
              <Badge variant="outline" className="text-xs">
                {creativity === 1 ? 'Conservative' :
                 creativity === 2 ? 'Cautious' :
                 creativity === 3 ? 'Balanced' :
                 creativity === 4 ? 'Creative' : 'Innovative'}
              </Badge>
            </div>
            <Slider
              value={[creativity]}
              onValueChange={(value) => setCreativity(value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher creativity means more novel suggestions and ideas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Your data is secure</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• All data is stored locally in your browser</li>
              <li>• AI conversations are encrypted in transit</li>
              <li>• No personal data is shared with third parties</li>
              <li>• You can delete all AI data anytime</li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm('This will delete all AI conversations and settings. Are you sure?')) {
                // Clear AI data
                localStorage.removeItem('ai-conversations')
                localStorage.removeItem('ai-current-conversation')
                localStorage.removeItem('ai-model')
                localStorage.removeItem('ai-auto-suggest')
                toast.success('All AI data cleared')
                window.location.reload()
              }
            }}
          >
            Clear All AI Data
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
