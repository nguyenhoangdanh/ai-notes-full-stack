# AI Notes - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: An intelligent, mobile-first note-taking application that leverages AI to enhance productivity and organization
- **Success Indicators**: Seamless offline/online sync, AI-powered features improve user workflow, mobile-optimized experience
- **Experience Qualities**: Intelligent, Responsive, Intuitive

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality, accounts, AI integration)
- **Primary User Activity**: Creating and Managing (note creation, organization, AI-assisted editing)

## Essential Features

### Phase 1: Core Foundations ✅
- **Authentication & Authorization**: JWT + OAuth (Google), credential login
- **Notes CRUD System**: Create, update, delete, search notes with rich-text editing
- **Search & Retrieval (RAG)**: Vector embeddings with semantic search via PostgreSQL PGVector
- **Mobile-First PWA**: Offline capabilities, service worker, responsive design

### Phase 2A: Smart AI Features 🚧  
- **Categories**: Auto-categorization of notes using ML
- **Duplicates**: Detecting and merging similar notes
- **Relations**: Discover related notes automatically
- **Summaries**: AI-generated summaries for notes
- **Chat Interface**: Real-time AI conversation with context awareness

### Phase 2B: Collaboration & Mobile Features 📋
- **Real-time Chat**: AI assistant with conversation history
- **Voice Notes**: Speech-to-text with transcription
- **Offline Sync**: Robust offline-first architecture
- **PWA Features**: Install prompts, push notifications, background sync

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional yet approachable, clean and focused
- **Design Personality**: Modern, minimalist with subtle AI-enhanced elements
- **Visual Metaphors**: Clean notebooks, intelligent assistance, seamless connectivity
- **Simplicity Spectrum**: Minimal interface that progressively reveals advanced features

### Color Strategy
- **Color Scheme Type**: Custom palette with purple-blue primary and warm accents
- **Primary Color**: `oklch(0.45 0.15 260)` - Professional purple for AI branding
- **Secondary Colors**: `oklch(0.85 0.08 260)` - Light purple for subtle backgrounds
- **Accent Color**: `oklch(0.7 0.15 45)` - Warm orange for highlights and CTAs
- **Background**: `oklch(0.98 0.02 260)` - Near-white with subtle purple tint
- **Foreground/Background Pairings**: 
  - Primary purple on white backgrounds
  - White text on purple backgrounds
  - Orange accents for actions and highlights

### Typography System
- **Font Pairing Strategy**: Single font family (Inter) for consistency
- **Typographic Hierarchy**: Clear distinction between headings, body, and UI text
- **Font Personality**: Clean, readable, modern sans-serif
- **Selected Font**: Inter (Google Fonts) for excellent readability across devices
- **Legibility Check**: Inter provides excellent legibility at all sizes

### Mobile-First Approach
- **Touch Optimization**: Minimum 44px touch targets, gesture-friendly interactions
- **Safe Area Handling**: PWA-compliant safe area insets for modern devices
- **Responsive Design**: Optimized for phones first, enhanced for tablets/desktop
- **Offline Indicators**: Clear visual feedback for connection status and sync state

### AI Integration Design
- **Contextual Intelligence**: AI features integrated naturally into workflow
- **Progressive Disclosure**: Advanced AI features revealed as users engage
- **Feedback Mechanisms**: Clear indicators for AI processing and suggestions
- **Trust Building**: Transparent AI decision-making with user control

## Implementation Architecture

### Frontend Stack
- **Framework**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Query (TanStack) + Context API
- **Icons**: Lucide React for consistent iconography
- **PWA**: Service Worker + Manifest for offline capabilities

### Backend Integration
- **API Client**: Type-safe fetch wrapper with error handling
- **Authentication**: JWT token management with auto-refresh
- **Offline Storage**: IndexedDB for local data persistence
- **Sync Strategy**: Optimistic updates with conflict resolution

### Key Components Architecture
- **AuthContext**: Centralized authentication state and token management
- **AIContext**: AI conversation and feature state management
- **OfflineNotesContext**: Local storage and sync coordination
- **Mobile-First Components**: Touch-optimized note editor, voice recorder, search

## Success Criteria
- **Performance**: Sub-200ms UI response times, reliable offline functionality
- **User Experience**: Intuitive note creation and organization workflow
- **AI Integration**: Natural, helpful AI assistance without friction
- **Mobile Excellence**: Feels native on mobile devices with PWA capabilities

## Technical Excellence
- **Type Safety**: Comprehensive TypeScript coverage with strict validation
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Accessibility**: WCAG AA compliance with keyboard navigation support
- **Progressive Enhancement**: Works without JavaScript, enhanced with AI features