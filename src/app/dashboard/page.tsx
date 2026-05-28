"use client"

import { useState } from "react"
import { Task } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Clock, CheckCircle2, BarChart } from "lucide-react"

const initialTasks: Task[] = [
  { id: "1", title: "Write blog post draft", description: "AI content for product launch", status: "todo", priority: "high", tags: ["content", "blog"] },
  { id: "2", title: "Design social media assets", description: "Create visuals for campaign", status: "in-progress", priority: "medium", tags: ["design", "social"] },
  { id: "3", title: "Review analytics report", description: "Monthly performance review", status: "todo", priority: "low", tags: ["analytics"] },
]

export default function DashboardPage() {
  const [tasks] = useState<Task[]>(initialTasks)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)

  const todoCount = tasks.filter(t => t.status === "todo").length
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length
  const doneCount = tasks.filter(t => t.status === "done").length

  return (
    <div className="p-8 max-w-7xl mx-auto">
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