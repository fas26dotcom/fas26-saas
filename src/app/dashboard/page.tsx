"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Task } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Clock, CheckCircle2, BarChart, Loader2, Sparkles, AlertCircle } from "lucide-react"

const initialTasks: Task[] = [
  { id: "1", title: "Write blog post draft", description: "AI content for product launch", status: "todo", priority: "high", tags: ["content", "blog"] },
  { id: "2", title: "Design social media assets", description: "Create visuals for campaign", status: "in-progress", priority: "medium", tags: ["design", "social"] },
  { id: "3", title: "Review analytics report", description: "Monthly performance review", status: "todo", priority: "low", tags: ["analytics"] },
]

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tasks] = useState<Task[]>(initialTasks)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)

  // Payment capture states
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureStatus, setCaptureStatus] = useState<"idle" | "success" | "error">("idle")
  const [capturePlan, setCapturePlan] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const payment = searchParams.get("payment")
    const plan = searchParams.get("plan")
    const token = searchParams.get("token") // PayPal Order ID

    if (payment === "success" && plan && token) {
      // Trigger secure PayPal Capture on the backend
      setIsCapturing(true)
      setCapturePlan(plan)
      
      fetch("/api/checkout/capture-paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: token, planName: plan })
      })
        .then(async (res) => {
          const data = await res.json()
          if (data.success) {
            setCaptureStatus("success")
            // Clean up the URL query params without reloading
            router.replace("/dashboard")
          } else {
            setCaptureStatus("error")
            setErrorMessage(data.error || "Failed to process PayPal capture")
          }
        })
        .catch((err) => {
          console.error("PayPal Capture error:", err)
          setCaptureStatus("error")
          setErrorMessage("Network error verifying transaction with PayPal")
        })
        .finally(() => {
          setIsCapturing(false)
        })
    }
  }, [searchParams, router])

  const todoCount = tasks.filter(t => t.status === "todo").length
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length
  const doneCount = tasks.filter(t => t.status === "done").length

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Secure Payment Capturing Modal */}
      {(isCapturing || captureStatus !== "idle") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden text-center animate-in zoom-in-95 duration-200">
            
            {isCapturing && (
              <div className="space-y-4 py-6">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifying PayPal Payment...</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Please hold tight while we securely capture your transaction and upgrade your account to the <strong>{capturePlan}</strong> plan.
                </p>
              </div>
            )}

            {captureStatus === "success" && (
              <div className="space-y-4 py-6">
                <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upgrade Successful! 🎉</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Thank you! Your transaction is captured. Your account is now active on the <strong>{capturePlan}</strong> plan tier.
                </p>
                <div className="pt-2">
                  <Button 
                    onClick={() => {
                      setCaptureStatus("idle")
                      window.location.reload() // Reload to refresh user session/plan in layout
                    }} 
                    className="w-full text-xs py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Enter Workspace
                  </Button>
                </div>
              </div>
            )}

            {captureStatus === "error" && (
              <div className="space-y-4 py-6">
                <div className="inline-flex p-3 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Verification Failed</h3>
                <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg font-mono">
                  {errorMessage}
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  If funds were deducted, please contact support with your PayPal Transaction ID.
                </p>
                <div className="pt-2 flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setCaptureStatus("idle")} 
                    className="flex-1 text-xs py-2"
                  >
                    Dismiss
                  </Button>
                  <Button 
                    onClick={() => router.push("/pricing")} 
                    className="flex-1 text-xs py-2 bg-indigo-650 hover:bg-indigo-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Productivity Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <PlusCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoCount}</div>
            <p className="text-xs text-gray-500">+2 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-gray-500">Active tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneCount}</div>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <BarChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8h 30m</div>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === "high" ? "bg-red-100 text-red-700" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    <div className="flex gap-2 mt-2">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Timer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-4">
                {Math.floor(pomodoroTime / 60)}:{(pomodoroTime % 60).toString().padStart(2, "0")}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPomodoroTime(25 * 60)}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}