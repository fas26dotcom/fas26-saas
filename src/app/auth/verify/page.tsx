"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email address...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Verification token is missing. Please check the link in your email.")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage(data.message || "Your email has been verified successfully!")
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed. The link may have expired or is invalid.")
        }
      } catch (err) {
        setStatus("error")
        setMessage("An unexpected connection error occurred. Please try again.")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <Card className="w-full max-w-md glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent text-center">
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="py-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          
          {status === "loading" && (
            <>
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {message}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-in zoom-in duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300 font-medium px-4">
                  {message}
                </p>
              </div>
              <Button onClick={() => router.push("/auth")} className="w-full glow-btn bg-indigo-600 hover:bg-indigo-750 text-white shadow-lg">
                Sign In to Your Account
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-500 dark:text-rose-450 animate-in zoom-in duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-rose-500 dark:text-rose-400 font-medium px-4">
                  {message}
                </p>
              </div>
              <div className="flex w-full gap-3">
                <Button variant="outline" onClick={() => router.push("/auth/signup")} className="flex-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                  Try Registering
                </Button>
                <Button onClick={() => router.push("/auth")} className="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white">
                  Back to Sign In
                </Button>
              </div>
            </>
          )}
          
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <Suspense fallback={
        <Card className="w-full max-w-md glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
            </div>
            <p className="text-slate-500">Loading page...</p>
          </CardContent>
        </Card>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
