import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Code, FileText, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Separator } from '../ui/separator';

interface HookFunction {
  name: string;
  hasUI: boolean;
  uiComponents: string[];
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface HookCategory {
  name: string;
  description: string;
  functions: HookFunction[];
}

const HOOK_COVERAGE_DATA: HookCategory[] = [
  {
    name: 'Authentication',
    description: 'User authentication and profile management',
    functions: [
      { name: 'useAuthProfile', hasUI: true, uiComponents: ['UserMenu', 'Sidebar'], description: 'Get current user profile', priority: 'high' },
      { name: 'useLogin', hasUI: true, uiComponents: ['AuthScreen'], description: 'User login', priority: 'high' },
      { name: 'useRegister', hasUI: true, uiComponents: ['AuthScreen'], description: 'User registration', priority: 'high' },
      { name: 'useLogout', hasUI: true, uiComponents: ['UserMenu'], description: 'User logout', priority: 'high' },
      { name: 'useUserSettings', hasUI: true, uiComponents: ['MobileSettingsSheet'], description: 'Get user settings', priority: 'medium' },
      { name: 'useUpdateSettings', hasUI: true, uiComponents: ['MobileSettingsSheet'], description: 'Update user settings', priority: 'medium' },
      { name: 'useResetSettings', hasUI: false, uiComponents: [], description: 'Reset user settings', priority: 'low' },
      { name: 'useUsage', hasUI: false, uiComponents: [], description: 'Get usage statistics', priority: 'medium' },
    ]
  },
  {
    name: 'Notes Management',
    description: 'Core note CRUD operations and management',
    functions: [
      { name: 'useNotes', hasUI: true, uiComponents: ['NotesList', 'Dashboard'], description: 'List all notes', priority: 'high' },
      { name: 'useNote', hasUI: true, uiComponents: ['NoteEditor'], description: 'Get single note', priority: 'high' },
      { name: 'useCreateNote', hasUI: true, uiComponents: ['Dashboard', 'EmptyState'], description: 'Create new note', priority: 'high' },
      { name: 'useUpdateNote', hasUI: true, uiComponents: ['NoteEditor'], description: 'Update note', priority: 'high' },
      { name: 'useDeleteNote', hasUI: true, uiComponents: ['NotesList', 'BulkActionsBar'], description: 'Delete note', priority: 'high' },
      { name: 'useSearchNotes', hasUI: true, uiComponents: ['SearchBar', 'NotesList'], description: 'Search notes', priority: 'high' },
      { name: 'useInfiniteNotes', hasUI: false, uiComponents: [], description: 'Infinite scroll notes', priority: 'medium' },
      { name: 'useNoteVersions', hasUI: false, uiComponents: [], description: 'Get note versions', priority: 'low' },
      { name: 'useNoteCollaborators', hasUI: false, uiComponents: [], description: 'Get note collaborators', priority: 'low' },
      { name: 'useNoteShareLinks', hasUI: false, uiComponents: [], description: 'Get share links', priority: 'medium' },
      { name: 'useNoteAttachments', hasUI: false, uiComponents: [], description: 'Get note attachments', priority: 'medium' },
    ]
  },
  {
    name: 'AI Features',
    description: 'AI-powered functionality and chat',
    functions: [
      { name: 'useStreamChat', hasUI: true, uiComponents: ['AIChatInterface'], description: 'Stream AI chat', priority: 'high' },
      { name: 'useCompleteChat', hasUI: true, uiComponents: ['AIChatInterface'], description: 'Complete AI chat', priority: 'high' },
      { name: 'useGenerateSuggestion', hasUI: true, uiComponents: ['AISuggestions'], description: 'Generate content suggestions', priority: 'high' },
      { name: 'useApplySuggestion', hasUI: true, uiComponents: ['AISuggestions'], description: 'Apply AI suggestion', priority: 'high' },
      { name: 'useAIConversations', hasUI: true, uiComponents: ['AIChatHistory'], description: 'List AI conversations', priority: 'medium' },
      { name: 'useCreateAIConversation', hasUI: false, uiComponents: [], description: 'Create AI conversation', priority: 'medium' },
      { name: 'useSemanticSearch', hasUI: false, uiComponents: [], description: 'Semantic search', priority: 'medium' },
      { name: 'useAdvancedSearch', hasUI: false, uiComponents: [], description: 'Advanced search', priority: 'medium' },
      { name: 'useAutoCategorizeNotes', hasUI: false, uiComponents: [], description: 'Auto categorize notes', priority: 'low' },
      { name: 'useDetectDuplicates', hasUI: false, uiComponents: [], description: 'Detect duplicate notes', priority: 'low' },
    ]
  },
  {
    name: 'Workspaces',
    description: 'Workspace management and organization',
    functions: [
      { name: 'useWorkspaces', hasUI: true, uiComponents: ['Sidebar'], description: 'List workspaces', priority: 'high' },
      { name: 'useCreateWorkspace', hasUI: false, uiComponents: [], description: 'Create workspace', priority: 'medium' },
      { name: 'useUpdateWorkspace', hasUI: true, uiComponents: ['WorkspaceSettingsPanel'], description: 'Update workspace', priority: 'medium' },
      { name: 'useDeleteWorkspace', hasUI: true, uiComponents: ['WorkspaceSettingsPanel'], description: 'Delete workspace', priority: 'medium' },
    ]
  },
  {
    name: 'Mobile Features',
    description: 'Mobile-specific functionality',
    functions: [
      { name: 'useIsMobile', hasUI: true, uiComponents: ['Dashboard', 'App'], description: 'Mobile detection', priority: 'high' },
      { name: 'useVoiceNotes', hasUI: true, uiComponents: ['VoiceNoteRecorder'], description: 'Voice notes', priority: 'medium' },
      { name: 'useCreateVoiceNote', hasUI: true, uiComponents: ['VoiceNoteRecorder'], description: 'Create voice note', priority: 'medium' },
    ]
  },
  {
    name: 'Feature Management',
    description: 'Feature flags and productivity tools',
    functions: [
      { name: 'usePomodoroSessions', hasUI: false, uiComponents: [], description: 'Pomodoro sessions', priority: 'low' },
      { name: 'useTasks', hasUI: false, uiComponents: [], description: 'Task management', priority: 'low' },
      { name: 'useTemplates', hasUI: false, uiComponents: [], description: 'Note templates', priority: 'medium' },
      { name: 'useTags', hasUI: true, uiComponents: ['Sidebar', 'NotesList'], description: 'Tag management', priority: 'medium' },
      { name: 'useNotifications', hasUI: false, uiComponents: [], description: 'Notifications', priority: 'low' },
    ]
  }
];

export function HookCoverageReport() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const calculateCoverage = (functions: HookFunction[]) => {
    const covered = functions.filter(f => f.hasUI).length;
    const total = functions.length;
    return { covered, total, percentage: Math.round((covered / total) * 100) };
  };

  const overallStats = HOOK_COVERAGE_DATA.reduce(
    (acc, category) => {
      const coverage = calculateCoverage(category.functions);
      return {
        covered: acc.covered + coverage.covered,
        total: acc.total + coverage.total,
      };
    },
    { covered: 0, total: 0 }
  );

  const overallPercentage = Math.round((overallStats.covered / overallStats.total) * 100);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Code className="h-6 w-6" />
          Hook Coverage Report
        </h1>
        <p className="text-muted-foreground">
          Analysis of hook function integration with UI components
        </p>
      </div>

      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Overall Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getCoverageColor(overallPercentage)}`}>
                {overallPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">UI Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {overallStats.covered}
              </div>
              <div className="text-sm text-muted-foreground">Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">
                {overallStats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total Hooks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        {HOOK_COVERAGE_DATA.map((category) => {
          const coverage = calculateCoverage(category.functions);
          const isExpanded = expandedCategories.includes(category.name);

          return (
            <Card key={category.name}>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {coverage.covered}/{coverage.total}
                        </Badge>
                        <div className={`text-sm font-medium ${getCoverageColor(coverage.percentage)}`}>
                          {coverage.percentage}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-2">
                      {category.functions.map((func) => (
                        <div 
                          key={func.name}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            {func.hasUI ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium text-sm">{func.name}</div>
                              <div className="text-xs text-muted-foreground">{func.description}</div>
                              {func.uiComponents.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {func.uiComponents.map(component => (
                                    <Badge key={component} variant="outline" className="text-xs">
                                      {component}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant={getPriorityColor(func.priority) as any}>
                            {func.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <h4 className="font-medium mb-2">High Priority Missing UI:</h4>
            <ul className="space-y-1 text-muted-foreground">
              {HOOK_COVERAGE_DATA.flatMap(cat => 
                cat.functions.filter(f => !f.hasUI && f.priority === 'high')
              ).map(func => (
                <li key={func.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {func.name} - {func.description}
                </li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div className="text-sm">
            <h4 className="font-medium mb-2">Suggested Next Steps:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Add usage statistics display in UserMenu</li>
              <li>• Create settings reset confirmation dialog</li>
              <li>• Implement workspace creation flow</li>
              <li>• Add semantic search interface</li>
              <li>• Create productivity tools (Pomodoro, Tasks)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
