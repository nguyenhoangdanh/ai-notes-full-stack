'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { Input } from '../ui/input'
import { Card } from '../ui/Card'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/Badge'
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
  Award,
  AlertCircle
} from 'lucide-react'
import { useLogin, useRegister } from '../../hooks'
import { authService, demoModeService } from '../../services'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const isLoading = loginMutation.isPending || registerMutation.isPending

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreedToTerms: false
    }
  })

  const currentForm = isLogin ? loginForm : registerForm

  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data)
      toast.success('Welcome back! 🎉')
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed. Please check your credentials.')
    }
  }

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password
      })
      toast.success('Account created successfully! 🎉')
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed. Please try again.')
    }
  }

  const handleDemoLogin = async () => {
    try {
      demoModeService.setDemoMode(true)
      await authService.demoLogin()
      
      toast.success('Welcome to AI Notes Demo! 🎉', {
        description: 'Explore all features with sample data. Changes won\'t be saved permanently.'
      })
    } catch (error) {
      console.error('Demo login failed:', error)
      toast.error('Demo mode failed to initialize')
    }
  }

  const handleSocialAuth = (provider: 'google' | 'github' | 'microsoft') => {
    toast.info(`${provider} authentication coming soon!`)
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    loginForm.reset()
    registerForm.reset()
    setShowPassword(false)
    setShowConfirmPassword(false)
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
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg-inset to-brand-50/30 flex">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                AI Notes
              </h1>
              <p className="text-fg-secondary text-sm">Intelligent note-taking platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="inline-flex">
                <Sparkles className="h-3 w-3 mr-1" />
                New: AI Writing Assistant
              </Badge>
              
              <h2 className="text-5xl font-bold leading-tight">
                Your thoughts,{' '}
                <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                  amplified
                </span>{' '}
                by AI
              </h2>
              
              <p className="text-xl text-fg-secondary leading-relaxed max-w-lg">
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
                    <h3 className="font-semibold text-fg">{feature.title}</h3>
                    <p className="text-sm text-fg-secondary">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-8 border-t border-neutral-3"
            >
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <stat.icon className="h-4 w-4 text-brand-600" />
                      <span className="text-2xl font-bold text-fg">{stat.value}</span>
                    </div>
                    <p className="text-sm text-fg-secondary">{stat.label}</p>
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                  AI Notes
                </h1>
                <p className="text-fg-secondary text-sm">Intelligent note-taking</p>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="p-8 shadow-lg border border-neutral-3">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-fg">
                  {isLogin ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-fg-secondary">
                  {isLogin 
                    ? 'Continue your AI-powered note-taking journey' 
                    : 'Join thousands of users enhancing their productivity'
                  }
                </p>
              </div>

              {/* Social Auth Buttons */}
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  onClick={() => handleSocialAuth('google')}
                  className="w-full h-12 gap-3 rounded-xl"
                  disabled={isLoading}
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => handleSocialAuth('github')}
                    className="h-12 gap-2 rounded-xl"
                    disabled={isLoading}
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => handleSocialAuth('microsoft')}
                    className="h-12 gap-2 rounded-xl"
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
                  <span className="bg-bg px-4 text-sm text-fg-secondary">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-fg-secondary">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        leftIcon={<Mail className="h-4 w-4" />}
                        className="h-12"
                        disabled={isLoading}
                        error={!!loginForm.formState.errors.email}
                        {...loginForm.register('email')}
                      />
                      {loginForm.formState.errors.email && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {loginForm.formState.errors.email.message}
                        </div>
                      )}
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-fg-secondary">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-xs text-brand-600 hover:text-brand-700 p-0 h-auto"
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          leftIcon={<Lock className="h-4 w-4" />}
                          className="h-12"
                          disabled={isLoading}
                          error={!!loginForm.formState.errors.password}
                          {...loginForm.register('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {loginForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-12 rounded-xl gap-2 mt-6"
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                      Sign In
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                  >
                    {/* Name field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-fg-secondary">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="h-12"
                        disabled={isLoading}
                        error={!!registerForm.formState.errors.name}
                        {...registerForm.register('name')}
                      />
                      {registerForm.formState.errors.name && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {registerForm.formState.errors.name.message}
                        </div>
                      )}
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-fg-secondary">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        leftIcon={<Mail className="h-4 w-4" />}
                        className="h-12"
                        disabled={isLoading}
                        error={!!registerForm.formState.errors.email}
                        {...registerForm.register('email')}
                      />
                      {registerForm.formState.errors.email && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {registerForm.formState.errors.email.message}
                        </div>
                      )}
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-fg-secondary">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          leftIcon={<Lock className="h-4 w-4" />}
                          className="h-12"
                          disabled={isLoading}
                          error={!!registerForm.formState.errors.password}
                          {...registerForm.register('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {registerForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password" className="text-fg-secondary">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          leftIcon={<Lock className="h-4 w-4" />}
                          className="h-12"
                          disabled={isLoading}
                          error={!!registerForm.formState.errors.confirmPassword}
                          {...registerForm.register('confirmPassword')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {registerForm.formState.errors.confirmPassword.message}
                        </div>
                      )}
                    </div>

                    {/* Terms checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-0.5 h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                        disabled={isLoading}
                        {...registerForm.register('agreedToTerms')}
                      />
                      <Label htmlFor="terms" className="text-sm text-fg-secondary leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <Button variant="ghost" className="text-brand-600 hover:text-brand-700 p-0 h-auto text-sm underline">
                          Terms of Service
                        </Button>{' '}
                        and{' '}
                        <Button variant="ghost" className="text-brand-600 hover:text-brand-700 p-0 h-auto text-sm underline">
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>
                    {registerForm.formState.errors.agreedToTerms && (
                      <div className="flex items-center gap-1 text-sm text-red-600 -mt-2">
                        <AlertCircle className="h-4 w-4" />
                        {registerForm.formState.errors.agreedToTerms.message}
                      </div>
                    )}

                    {/* Submit button */}
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-12 rounded-xl gap-2 mt-6"
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                      Create Account
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Demo Login */}
              <div className="space-y-4">
                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-bg px-4 text-sm text-fg-secondary">Try demo</span>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full h-12 gap-2 rounded-xl border-brand-200 text-brand-700 hover:bg-brand-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Explore Demo Version
                </Button>
              </div>

              {/* Toggle between login/register */}
              <div className="text-center pt-4 border-t border-neutral-3">
                <p className="text-sm text-fg-secondary">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleAuthMode}
                  className="text-brand-600 hover:text-brand-700 font-semibold p-0 h-auto underline"
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
                className="p-4 rounded-xl border border-neutral-3 text-center bg-bg-overlay"
              >
                <feature.icon className={cn("h-5 w-5 mx-auto mb-2", feature.color)} />
                <p className="text-xs font-medium text-fg">{feature.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Mobile Download Links */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-xs text-fg-secondary mb-3">Also available on mobile</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm" className="gap-2 rounded-xl">
                <Smartphone className="h-3 w-3" />
                <span className="text-xs">iOS</span>
              </Button>
              <Button variant="secondary" size="sm" className="gap-2 rounded-xl">
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
