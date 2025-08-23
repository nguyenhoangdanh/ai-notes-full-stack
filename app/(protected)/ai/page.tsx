'use client'

import { Badge, Button, Card } from '@/components'
import { GradientCallout, PageHeader, Panel } from '@/components/ui'
import { 
  Sparkles, 
  MessageSquare, 
  Brain, 
  Zap, 
  ArrowRight,
  FileText,
  Network,
  Search,
  Lightbulb,
  BarChart3,
  Copy
} from 'lucide-react'

export default function AIPage() {
  const handleStartChat = () => {
    window.location.href = '/ai/chat'
  }

  const handleLearnMore = () => {
    // Navigate to documentation
  }

  return (
    <>
      {/* <PageMeta
        title="AI Assistant"
        description="Enhance your productivity with AI-powered features. Get intelligent suggestions, automated summaries, and smart content generation."
        keywords={['AI assistant', 'artificial intelligence', 'smart suggestions', 'content generation', 'productivity', 'automation']}
        type="website"
      /> */}
      
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="AI Assistant"
          subtitle="Get intelligent insights and assistance for your notes"
          description="Harness the power of AI to summarize, analyze, and generate insights from your notes. Our intelligent assistant helps you work smarter, not harder."
          icon={Sparkles}
          badge={{ text: 'AI-Powered', variant: 'ai' }}
          actions={
            <Button
              variant="cta" 
              icon={MessageSquare}
              onClick={handleStartChat}
            >
              Start Chatting
            </Button>
          }
        />

        {/* Main AI Features Callout */}
        <GradientCallout
          variant="ai"
          size="lg"
          title="Intelligent Note Assistant"
          description="Get intelligent insights and assistance with your notes using AI. Our assistant can help summarize content, find connections between ideas, and generate insights to accelerate your productivity."
          badge={{ text: "Try AI Now", variant: "ai" }}
          action={{
            label: "Start Conversation",
            onClick: handleStartChat,
            icon: MessageSquare,
            variant: "primary"
          }}
          secondaryAction={{
            label: "Learn More",
            onClick: handleLearnMore
          }}
        />

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Assistant */}
          <Card 
            variant="glass" 
            className="p-6 space-y-4 hover-lift cursor-pointer"
            onClick={handleStartChat}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-600/10 to-purple/10 border border-glass-border">
                <MessageSquare className="w-6 h-6 text-primary-600" />
              </div>
              <Badge variant="ai" size="sm">Popular</Badge>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">AI Chat</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Have conversations with your notes. Ask questions, get summaries, and discover insights.
              </p>
            </div>
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                Start Chatting
              </Button>
            </div>
          </Card>

          {/* Smart Summaries */}
          <Card 
            variant="glass" 
            className="p-6 space-y-4 hover-lift cursor-pointer"
            onClick={() => window.location.href = '/summaries'}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-green-400/10 border border-glass-border">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <Badge variant="success" size="sm">New</Badge>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">Smart Summaries</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Generate AI-powered summaries of your notes, documents, and meeting transcripts.
              </p>
            </div>
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View Summaries
              </Button>
            </div>
          </Card>

          {/* Relations Discovery */}
          <Card 
            variant="glass" 
            className="p-6 space-y-4 hover-lift cursor-pointer"
            onClick={() => window.location.href = '/relations'}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-br from-info/10 to-blue-400/10 border border-glass-border">
                <Network className="w-6 h-6 text-info" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">Relations</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Discover connections between your notes and ideas with AI-powered relationship mapping.
              </p>
            </div>
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                Explore Relations
              </Button>
            </div>
          </Card>

          {/* Smart Search */}
          <Card 
            variant="glass" 
            className="p-6 space-y-4 hover-lift cursor-pointer"
            onClick={() => window.location.href = '/search'}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple/10 to-violet-400/10 border border-glass-border">
                <Search className="w-6 h-6 text-purple" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">Smart Search</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Find anything across your notes using natural language and semantic understanding.
              </p>
            </div>
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                Advanced Search
              </Button>
            </div>
          </Card>

          {/* Auto-Insights */}
          <Card 
            variant="glass" 
            className="p-6 space-y-4 hover-lift cursor-pointer"
            onClick={() => window.location.href = '/analytics'}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-br from-warning/10 to-yellow-400/10 border border-glass-border">
                <Lightbulb className="w-6 h-6 text-warning" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">Auto-Insights</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Get automatic insights and patterns discovered from your note-taking habits.
              </p>
            </div>
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View Insights
              </Button>
            </div>
          </Card>

          {/* Duplicate Detection */}
          <Card 
            variant="glass" 
            className="p-6 space-y-4 hover-lift cursor-pointer"
            onClick={() => window.location.href = '/duplicates'}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-br from-danger/10 to-red-400/10 border border-glass-border">
                <Copy className="w-6 h-6 text-danger" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text mb-2">Duplicate Detection</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Automatically identify and merge duplicate or similar notes to keep your workspace clean.
              </p>
            </div>
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                Find Duplicates
              </Button>
            </div>
          </Card>
        </div>

        {/* Getting Started Panel */}
        <Panel
          title="Getting Started with AI"
          subtitle="Quick tips and tutorials"
          icon={Brain}
          toolbar={
            <Button variant="secondary" size="sm">
              View All Tips
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-bg-elev-1 space-y-2">
                <h4 className="font-medium text-text">💬 Start a conversation</h4>
                <p className="text-sm text-text-muted">
                  Ask questions like "Summarize my meeting notes from this week" or "What are the main themes in my research?"
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-bg-elev-1 space-y-2">
                <h4 className="font-medium text-text">🔍 Use natural language</h4>
                <p className="text-sm text-text-muted">
                  Search using everyday language. Try "notes about project planning" instead of exact keywords.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-bg-elev-1 space-y-2">
                <h4 className="font-medium text-text">📊 Generate insights</h4>
                <p className="text-sm text-text-muted">
                  Let AI analyze your notes to find patterns, suggest categories, and highlight important connections.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-bg-elev-1 space-y-2">
                <h4 className="font-medium text-text">⚡ Save time</h4>
                <p className="text-sm text-text-muted">
                  Use AI summaries and auto-categorization to spend less time organizing and more time creating.
                </p>
              </div>
            </div>
            
            <div className="pt-4 text-center">
              <Button variant="primary" icon={MessageSquare} onClick={handleStartChat}>
                Try AI Assistant Now
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  )
}
