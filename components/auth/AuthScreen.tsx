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
  Github,
  Chrome,
  Star,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react'
import { useLogin, useRegister } from '../../hooks'
import { authService } from '../../services'
import { toast } from 'sonner'

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

  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data)
      toast.success('Welcome back! 🎉')
      // Redirect to dashboard after successful login
      // window.location.href = '/dashboard'
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
      // Redirect to dashboard after successful registration
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed. Please try again.')
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

  // Features for marketing side
  const features = [
    { 
      icon: Brain, 
      title: 'AI-Powered', 
      description: 'Smart categorization and insights'
    },
    { 
      icon: Shield, 
      title: 'Offline Ready', 
      description: 'Works without internet connection'
    },
    { 
      icon: Users, 
      title: 'Team Collaboration', 
      description: 'Real-time collaborative editing'
    },
    { 
      icon: Zap, 
      title: 'Lightning Fast', 
      description: 'Instant search and sync'
    }
  ]

  // Stats for social proof
  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Notes Created', value: '2M+', icon: TrendingUp },
    { label: 'Customer Rating', value: '4.9/5', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-neutral-1 flex">
      {/* Left Panel - Marketing Content */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-2 via-neutral-3 to-neutral-4"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Logo */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent-9 rounded-xl">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <span className="text-xl font-semibold text-neutral-12">AI Notes</span>
              </div>
              <p className="text-neutral-11 text-sm">Intelligent note-taking platform</p>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-12 leading-tight">
                Your thoughts,{' '}
                <span className="text-accent-11">by AI</span>
              </h1>
              
              <p className="text-lg text-neutral-11 leading-relaxed">
                Transform the way you capture, organize, and discover insights from your notes with intelligent AI assistance.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 p-2 bg-neutral-4 rounded-lg">
                    <feature.icon className="h-5 w-5 text-accent-11" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-12">{feature.title}</h3>
                    <p className="text-sm text-neutral-11">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-5"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <stat.icon className="h-4 w-4 text-accent-11" />
                    <span className="text-lg font-bold text-neutral-12">{stat.value}</span>
                  </div>
                  <p className="text-xs text-neutral-11">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-neutral-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2.5 bg-accent-9 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-neutral-12">AI Notes</span>
            </div>
            <p className="text-neutral-11 text-sm">Intelligent note-taking platform</p>
          </div>

          {/* Auth Card */}
          <Card className="border border-neutral-6 bg-neutral-2 shadow-lg">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-neutral-12">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-neutral-11 text-sm">
                  {isLogin 
                    ? 'Continue your AI-powered note-taking journey' 
                    : 'Join thousands enhancing their productivity'
                  }
                </p>
              </div>

              {/* Social Auth Buttons */}
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  onClick={() => handleSocialAuth('google')}
                  className="w-full h-11 gap-3 border border-neutral-6 hover:border-neutral-7 bg-neutral-3 hover:bg-neutral-4"
                  disabled={isLoading}
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => handleSocialAuth('github')}
                    className="h-11 gap-2 border border-neutral-6 hover:border-neutral-7 bg-neutral-3 hover:bg-neutral-4"
                    disabled={isLoading}
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => handleSocialAuth('microsoft')}
                    className="h-11 gap-2 border border-neutral-6 hover:border-neutral-7 bg-neutral-3 hover:bg-neutral-4"
                    disabled={isLoading}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                    </svg>
                    Microsoft
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <Separator className="bg-neutral-6" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-neutral-2 px-3 text-xs text-neutral-11">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-neutral-12 text-sm">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          className="h-11 bg-neutral-3 border-neutral-6 text-neutral-12 placeholder:text-neutral-10"
                          disabled={isLoading}
                          error={!!loginForm.formState.errors.email}
                          {...loginForm.register('email')}
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-10" />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-red-10 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-neutral-12 text-sm">
                          Password *
                        </Label>
                        <button
                          type="button"
                          className="text-xs text-accent-11 hover:text-accent-12"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="h-11 bg-neutral-3 border-neutral-6 text-neutral-12 placeholder:text-neutral-10 pr-10"
                          disabled={isLoading}
                          error={!!loginForm.formState.errors.password}
                          {...loginForm.register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-10 hover:text-neutral-12"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-red-10 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-accent-9 hover:bg-accent-10 text-white font-medium gap-2 mt-6"
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
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                  >
                    {/* Name field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-neutral-12 text-sm">
                        Full Name *
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Your full name"
                        className="h-11 bg-neutral-3 border-neutral-6 text-neutral-12 placeholder:text-neutral-10"
                        disabled={isLoading}
                        error={!!registerForm.formState.errors.name}
                        {...registerForm.register('name')}
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-xs text-red-10 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-neutral-12 text-sm">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          className="h-11 bg-neutral-3 border-neutral-6 text-neutral-12 placeholder:text-neutral-10"
                          disabled={isLoading}
                          error={!!registerForm.formState.errors.email}
                          {...registerForm.register('email')}
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-10" />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-xs text-red-10 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-neutral-12 text-sm">
                          Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="h-11 bg-neutral-3 border-neutral-6 text-neutral-12 placeholder:text-neutral-10 pr-10"
                            disabled={isLoading}
                            error={!!registerForm.formState.errors.password}
                            {...registerForm.register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-10 hover:text-neutral-12"
                          >
                            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password" className="text-neutral-12 text-sm">
                          Confirm *
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="h-11 bg-neutral-3 border-neutral-6 text-neutral-12 placeholder:text-neutral-10 pr-10"
                            disabled={isLoading}
                            error={!!registerForm.formState.errors.confirmPassword}
                            {...registerForm.register('confirmPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-10 hover:text-neutral-12"
                          >
                            {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Error messages for passwords */}
                    {(registerForm.formState.errors.password || registerForm.formState.errors.confirmPassword) && (
                      <div className="space-y-1">
                        {registerForm.formState.errors.password && (
                          <p className="text-xs text-red-10 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-red-10 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Terms checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-0.5 h-4 w-4 rounded border-neutral-6 text-accent-9 focus:ring-accent-9 bg-neutral-3"
                        disabled={isLoading}
                        {...registerForm.register('agreedToTerms')}
                      />
                      <Label htmlFor="terms" className="text-xs text-neutral-11 leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <button type="button" className="text-accent-11 hover:text-accent-12 underline">
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button type="button" className="text-accent-11 hover:text-accent-12 underline">
                          Privacy Policy
                        </button>
                      </Label>
                    </div>
                    {registerForm.formState.errors.agreedToTerms && (
                      <p className="text-xs text-red-10 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {registerForm.formState.errors.agreedToTerms.message}
                      </p>
                    )}

                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-accent-9 hover:bg-accent-10 text-white font-medium gap-2 mt-6"
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                      Create Account
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Toggle between login/register */}
              <div className="text-center pt-4 border-t border-neutral-6">
                <p className="text-sm text-neutral-11">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </p>
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-accent-11 hover:text-accent-12 font-medium underline"
                  disabled={isLoading}
                >
                  {isLogin ? 'Create account' : 'Sign in'}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
