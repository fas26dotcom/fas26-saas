"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const registered = searchParams.get("registered") === "true"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/auth/[...nextauth]", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        // Trigger page reload to update LayoutShell state
        window.location.href = "/dashboard"
      } else {
        setError(data.error || "Invalid credentials")
      }
    } catch {
      setError("Unable to connect to the authentication server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {registered && !error && (
            <div className="p-3 text-sm text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl animate-in fade-in duration-300">
              🎉 Registration successful! Please log in below.
            </div>
          )}
          {error && (
            <div className="p-3 text-sm text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl">
              ⚠️ {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex justify-end text-sm">
            <a href="/auth/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Forgot password?
            </a>
          </div>
          <Button className="w-full glow-btn bg-indigo-600 hover:bg-indigo-750 text-white shadow-lg" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Do not have an account? <a href="/auth/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Sign up</a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  )
}