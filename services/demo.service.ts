// Basic demo service for development and demo purposes
export class DemoModeService {
  private isDemoModeEnabled = false

  setDemoMode(enabled: boolean): void {
    this.isDemoModeEnabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-notes-demo-mode', enabled.toString())
    }
  }

  isDemoMode(): boolean {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('ai-notes-demo-mode')
    return stored ? stored === 'true' : this.isDemoModeEnabled
  }

  getDemoUser() {
    return {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  resetDemoData(): void {
    if (typeof window !== 'undefined') {
      // Clear demo data from local storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('ai-notes-')) {
          localStorage.removeItem(key)
        }
      })
    }
  }
}

export const demoModeService = new DemoModeService()