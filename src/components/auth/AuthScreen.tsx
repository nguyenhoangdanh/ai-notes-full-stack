import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Brain, 
  Mail, 
  Lock, 
  Eye, 
  EyeSlash,
  Sparkle
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export function AuthScreen() {
  const [, setUser] = useKV('current-user', null)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate authentication for demo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = {
        id: 'demo-user-' + Date.now(),
        email,
        name: name || email.split('@')[0],
        image: null
      }
      
      setUser(user)
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!')
    } catch (error) {
      console.error('Auth failed:', error)
      toast.error('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const demoUser = {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        image: null
      }
      
      setUser(demoUser)
      toast.success('Welcome to the demo!')
    } catch (error) {
      console.error('Demo login failed:', error)
      toast.error('Demo login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4"
          >
            <Brain className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Notes
          </h1>
          <p className="text-muted-foreground mt-2">
            Intelligent note-taking with offline capabilities
          </p>
        </div>

        {/* Auth Form */}
        <Card className="p-6 backdrop-blur-sm">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isLogin ? 'Sign in to continue' : 'Get started with AI Notes'}
              </p>
            </div>

            {/* Name field for registration */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  {showPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle between login/register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary p-0 h-auto font-semibold"
            >
              {isLogin ? 'Create account' : 'Sign in'}
            </Button>
          </div>

          {/* Demo login */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full mt-4 h-12"
            >
              <Sparkle className="h-4 w-4 mr-2" />
              Try Demo
            </Button>
          </div>
        </Card>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-2 gap-4 text-center"
        >
          <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm">
            <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium">AI-Powered</p>
            <p className="text-xs text-muted-foreground">Smart categorization</p>
          </div>
          
          <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="h-6 w-6 bg-green-500 rounded mx-auto mb-2" />
            <p className="text-xs font-medium">Offline Ready</p>
            <p className="text-xs text-muted-foreground">Works anywhere</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}