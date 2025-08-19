/**
 * Demo mode service - provides mock data when backend is unavailable
 * This allows users to explore the AI Notes frontend features without a backend
 */

import type { User, AuthResponseDto, LoginDto, RegisterDto } from '../types/auth.types'
import type { Note, CreateNoteDto, UpdateNoteDto } from '../types/note.types'
import type { Workspace, CreateWorkspaceDto } from '../types/workspace.types'

// Demo user data
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@ai-notes.app',
  name: 'Demo User',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Demo workspace
const DEMO_WORKSPACE: Workspace = {
  id: 'demo-workspace-001',
  name: 'My Demo Workspace',
  description: 'Welcome to AI Notes! This is your demo workspace.',
  isDefault: true,
  ownerId: 'demo-user-001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Demo notes
const DEMO_NOTES: Note[] = [
  {
    id: 'demo-note-001',
    title: 'Welcome to AI Notes!',
    content: `# Welcome to AI Notes! 🎉

Thank you for trying our demo! This is a sample note to show you what's possible.

## Features you can explore:

### ✨ Smart Note Taking
- **Markdown support** for rich formatting
- **Tag system** for organization
- **Search functionality** to find anything quickly

### 🤖 AI-Powered Features  
- Smart categorization (coming soon)
- Content suggestions (coming soon)
- Auto-summarization (coming soon)

### 🚀 Productivity Tools
- Task management with priorities
- Pomodoro timer for focused work
- Calendar integration
- Review system for knowledge retention

### 👥 Collaboration
- Real-time collaborative editing (coming soon)
- Comments and discussions (coming soon)
- Share notes with team members (coming soon)

> **Note**: This is a demo environment. To access the full features with data persistence, please connect to the AI Notes backend or sign up for our hosted service.

**Happy note-taking!** 📝`,
    tags: ['welcome', 'demo', 'getting-started'],
    workspaceId: 'demo-workspace-001',
    ownerId: 'demo-user-001',
    isDeleted: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()  // 12 hours ago
  },
  {
    id: 'demo-note-002',
    title: 'Meeting Notes Template',
    content: `# Meeting Notes - [Date]

**Attendees**: 
- 
- 
- 

**Agenda**:
1. 
2. 
3. 

## Discussion Points

### Topic 1
- 
- 

### Topic 2
- 
- 

## Action Items
- [ ] Task 1 (Assigned to: )
- [ ] Task 2 (Assigned to: )
- [ ] Task 3 (Assigned to: )

## Next Steps
- 
- 

---
*Meeting concluded at: [Time]*`,
    tags: ['template', 'meetings', 'collaboration'],
    workspaceId: 'demo-workspace-001',
    ownerId: 'demo-user-001',
    isDeleted: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-note-003',
    title: 'Project Ideas Brainstorm',
    content: `# Project Ideas Brainstorm 💡

## Tech Projects
- [ ] **AI-powered note organizer** - Use ML to automatically categorize and tag notes
- [ ] **Voice-to-text note app** - Quick note capture while on the go
- [ ] **Collaborative research tool** - Team-based knowledge management
- [ ] **Smart reminder system** - Context-aware notifications

## Creative Projects  
- [ ] **Digital art portfolio** - Showcase and organize artwork
- [ ] **Writing assistant** - Help with story structure and character development
- [ ] **Music practice tracker** - Log practice sessions and progress
- [ ] **Recipe organizer** - Smart meal planning and grocery lists

## Learning Goals
- [ ] **Master TypeScript** - Build type-safe applications
- [ ] **Learn Docker** - Containerization and deployment
- [ ] **Study AI/ML** - Machine learning fundamentals
- [ ] **UI/UX Design** - Create better user experiences

## Business Ideas
- [ ] **Productivity SaaS** - Tools for remote teams
- [ ] **Educational platform** - Interactive learning experiences
- [ ] **Wellness app** - Mental health and mindfulness
- [ ] **Local service marketplace** - Connect neighbors

---
*Last updated: ${new Date().toLocaleDateString()}*`,
    tags: ['brainstorm', 'ideas', 'projects', 'goals'],
    workspaceId: 'demo-workspace-001',
    ownerId: 'demo-user-001',
    isDeleted: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()      // 2 hours ago
  }
]

class DemoModeService {
  private isDemo = false
  private demoData = {
    user: DEMO_USER,
    workspace: DEMO_WORKSPACE,
    notes: [...DEMO_NOTES] // Create a copy to avoid mutations
  }

  setDemoMode(enabled: boolean) {
    this.isDemo = enabled
    if (enabled) {
      console.log('🎭 Demo mode enabled - using mock data')
      // Store demo flag in localStorage
      localStorage.setItem('ai-notes-demo-mode', 'true')
    } else {
      localStorage.removeItem('ai-notes-demo-mode')
    }
  }

  isDemoMode(): boolean {
    if (typeof window === 'undefined') return false
    return this.isDemo || localStorage.getItem('ai-notes-demo-mode') === 'true'
  }

  // Auth methods
  async demoLogin(): Promise<AuthResponseDto> {
    this.setDemoMode(true)
    return {
      access_token: 'demo-token-' + Date.now(),
      user: {
        id: this.demoData.user.id,
        email: this.demoData.user.email,
        name: this.demoData.user.name,
        image: this.demoData.user.avatar
      }
    }
  }

  getDemoUser(): User {
    return { ...this.demoData.user }
  }

  // Notes methods
  getDemoNotes(): Note[] {
    return [...this.demoData.notes]
  }

  getDemoNote(id: string): Note {
    const note = this.demoData.notes.find(n => n.id === id)
    if (!note) {
      throw new Error('Note not found')
    }
    return { ...note }
  }

  async createDemoNote(data: CreateNoteDto): Promise<Note> {
    const newNote: Note = {
      id: 'demo-note-' + Date.now(),
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
      workspaceId: data.workspaceId || this.demoData.workspace.id,
      ownerId: this.demoData.user.id,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.demoData.notes.unshift(newNote) // Add to beginning
    return { ...newNote }
  }

  async updateDemoNote(id: string, data: UpdateNoteDto): Promise<Note> {
    const noteIndex = this.demoData.notes.findIndex(note => note.id === id)
    if (noteIndex === -1) {
      throw new Error('Note not found')
    }

    const updatedNote = {
      ...this.demoData.notes[noteIndex],
      ...data,
      updatedAt: new Date().toISOString()
    }

    this.demoData.notes[noteIndex] = updatedNote
    return { ...updatedNote }
  }

  async deleteDemoNote(id: string): Promise<void> {
    const noteIndex = this.demoData.notes.findIndex(note => note.id === id)
    if (noteIndex === -1) {
      throw new Error('Note not found')
    }

    this.demoData.notes.splice(noteIndex, 1)
  }

  searchDemoNotes(query: string): Note[] {
    if (!query.trim()) return this.getDemoNotes()
    
    const searchTerm = query.toLowerCase()
    return this.demoData.notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // Workspace methods
  getDemoWorkspace(): Workspace {
    return { ...this.demoData.workspace }
  }

  // Reset demo data
  resetDemoData() {
    this.demoData.notes = [...DEMO_NOTES]
    console.log('🔄 Demo data reset')
  }
}

export const demoModeService = new DemoModeService()