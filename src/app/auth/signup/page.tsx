"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (data.success) {
        setIsSuccess(true)
      } else {
        setError(data.error || "Signup failed")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <Card className="w-full max-w-md glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {isSuccess ? "Confirm Registration" : "Create Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-bounce">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  We've sent a verification link to:
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                  {email}
                </p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
                Please check your email inbox and click the verification link to activate your account.
              </p>
              <Button onClick={() => router.push("/auth")} className="w-full glow-btn bg-indigo-600 hover:bg-indigo-750 text-white shadow-lg">
                Go to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl">
                  ⚠️ {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <Button className="w-full glow-btn bg-indigo-600 hover:bg-indigo-750 text-white shadow-lg" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account? <a href="/auth" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Sign in</a>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
