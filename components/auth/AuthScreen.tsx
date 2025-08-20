'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { 
  Brain, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Sparkles,
  Shield,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Globe,
  Github,
  Chrome,
  Smartphone,
  Download,
  Star,
  TrendingUp,
  Award
} from 'lucide-react'
import { useLogin, useRegister } from '../../hooks'
import { authService, demoModeService } from '../../services'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const isLoading = loginMutation.isPending || registerMutation.isPending

  // Form validation
  const isFormValid = () => {
    if (!email || !password) return false
    if (!isLogin && (!name || !agreedToTerms)) return false
    return true
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ email, password })
        toast.success('Welcome back! 🎉')
      } else {
        await registerMutation.mutateAsync({ email, password, name })
        toast.success('Account created successfully! 🎉')
      }
    } catch (error) {
      console.error('Auth failed:', error)
    }
  }

  const handleDemoLogin = async () => {
    try {
      demoModeService.setDemoMode(true)
      const result = await authService.demoLogin()
      
      toast.success('Welcome to AI Notes Demo! 🎉', {
        description: 'Explore all features with sample data. Changes won\'t be saved permanently.'
      })
      
      loginMutation.mutate({ 
        email: 'demo@ai-notes.app', 
        password: 'demo-mode' 
      })
    } catch (error) {
      console.error('Demo login failed:', error)
      toast.error('Demo mode failed to initialize')
    }
  }

  const handleSocialAuth = (provider: 'google' | 'github' | 'microsoft') => {
    toast.info(`${provider} authentication coming soon!`)
  }

  // Features for marketing
  const features = [
    { 
      icon: Brain, 
      title: 'AI-Powered', 
      description: 'Smart categorization and insights',
      color: 'text-purple-600'
    },
    { 
      icon: Shield, 
      title: 'Offline Ready', 
      description: 'Works without internet connection',
      color: 'text-green-600'
    },
    { 
      icon: Users, 
      title: 'Team Collaboration', 
      description: 'Real-time collaborative editing',
      color: 'text-blue-600'
    },
    { 
      icon: Zap, 
      title: 'Lightning Fast', 
      description: 'Instant search and sync',
      color: 'text-yellow-600'
    }
  ]

  // Stats for social proof
  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Notes Created', value: '2M+', icon: TrendingUp },
    { label: 'Customer Rating', value: '4.9/5', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg-elevated to-brand-50/30 flex">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-brand-100/30 rounded-full blur-2xl" />
      </div>

      {/* Left Panel - Marketing Content */}
      <div className="hidden lg:flex flex-1 relative z-10 flex-col justify-center p-16 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-3">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">AI Notes</h1>
              <p className="text-text-muted text-sm">Intelligent note-taking platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="feature" className="inline-flex">
                <Sparkles className="h-3 w-3 mr-1" />
                New: AI Writing Assistant
              </Badge>
              
              <h2 className="text-5xl font-bold leading-tight">
                Your thoughts,{' '}
                <span className="text-gradient">amplified</span>{' '}
                by AI
              </h2>
              
              <p className="text-xl text-text-secondary leading-relaxed max-w-lg">
                Transform the way you capture, organize, and discover insights from your notes with intelligent AI assistance.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className={cn("p-3 rounded-xl w-fit", 
                    feature.color === 'text-purple-600' && "bg-purple-100",
                    feature.color === 'text-green-600' && "bg-green-100",
                    feature.color === 'text-blue-600' && "bg-blue-100",
                    feature.color === 'text-yellow-600' && "bg-yellow-100"
                  )}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{feature.title}</h3>
                    <p className="text-sm text-text-muted">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-8 border-t border-border-subtle"
            >
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <stat.icon className="h-4 w-4 text-brand-600" />
                      <span className="text-2xl font-bold text-text">{stat.value}</span>
                    </div>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gradient">AI Notes</h1>
                <p className="text-text-muted text-sm">Intelligent note-taking</p>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <Card variant="glass" className="p-8 shadow-5 border border-border-subtle">
            {/* Header */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-text">
                  {isLogin ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-text-secondary">
                  {isLogin 
                    ? 'Continue your AI-powered note-taking journey' 
                    : 'Join thousands of users enhancing their productivity'
                  }
                </p>
              </div>

              {/* Social Auth Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('google')}
                  className="w-full h-12 gap-3 rounded-xl hover-lift"
                  disabled={isLoading}
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialAuth('github')}
                    className="h-12 gap-2 rounded-xl hover-lift"
                    disabled={isLoading}
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSocialAuth('microsoft')}
                    className="h-12 gap-2 rounded-xl hover-lift"
                    disabled={isLoading}
                  >
                    <Globe className="h-4 w-4" />
                    Microsoft
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-surface px-4 text-sm text-text-muted">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {/* Name field for registration */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="name" className="text-text-secondary">
                        Full Name <span className="text-danger">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 rounded-xl"
                        disabled={isLoading}
                        required={!isLogin}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary">
                    Email Address <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                    className="h-12 rounded-xl"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-text-secondary">
                      Password <span className="text-danger">*</span>
                    </Label>
                    {isLogin && (
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs text-brand-600 hover:text-brand-700 p-0 h-auto"
                      >
                        Forgot password?
                      </Button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:bg-transparent"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    }
                    className="h-12 rounded-xl"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Terms checkbox for registration */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 pt-2"
                    >
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                        disabled={isLoading}
                      />
                      <Label htmlFor="terms" className="text-sm text-text-secondary leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <Button variant="link" className="text-brand-600 hover:text-brand-700 p-0 h-auto text-sm">
                          Terms of Service
                        </Button>{' '}
                        and{' '}
                        <Button variant="link" className="text-brand-600 hover:text-brand-700 p-0 h-auto text-sm">
                          Privacy Policy
                        </Button>
                      </Label>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-12 rounded-xl gap-2 mt-6 shadow-3 hover:shadow-4"
                  disabled={isLoading || !isFormValid()}
                  loading={isLoading}
                >
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              {/* Demo Login */}
              <div className="space-y-4">
                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-surface px-4 text-sm text-text-muted">Try demo</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full h-12 gap-2 rounded-xl border-brand-200 text-brand-700 hover:bg-brand-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Explore Demo Version
                </Button>
              </div>

              {/* Toggle between login/register */}
              <div className="text-center pt-4 border-t border-border-subtle">
                <p className="text-sm text-text-muted">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setAgreedToTerms(false)
                  }}
                  className="text-brand-600 hover:text-brand-700 font-semibold p-0 h-auto"
                  disabled={isLoading}
                >
                  {isLogin ? 'Create account' : 'Sign in'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Mobile Features */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-4">
            {features.slice(0, 4).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="p-4 rounded-xl glass border border-border-subtle text-center"
              >
                <feature.icon className={cn("h-5 w-5 mx-auto mb-2", feature.color)} />
                <p className="text-xs font-medium text-text">{feature.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Mobile Download Links */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-xs text-text-muted mb-3">Also available on mobile</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <Smartphone className="h-3 w-3" />
                <span className="text-xs">iOS</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <Download className="h-3 w-3" />
                <span className="text-xs">Android</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
