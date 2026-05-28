"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(data.message)
      } else {
        setError(data.error || "Failed to process request.")
      }
    } catch {
      setError("Unable to connect to the authentication server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-950/50 p-4">
      <Card className="w-full max-w-md glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Forgot Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we will send you a recovery link to choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="p-3 text-sm text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl">
                📬 {message}
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl">
                ⚠️ {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || !!message}
              />
            </div>
            <Button 
              className="w-full glow-btn bg-indigo-600 hover:bg-indigo-750 text-white shadow-lg" 
              disabled={isLoading || !!message}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <a href="/auth" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
