"use client"

import { useState, useEffect } from "react"
import { Task } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Kanban, List, Loader2, Edit2, Trash2, CheckSquare } from "lucide-react"

export default function WorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<"list" | "kanban">("list")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form states
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")
  const [newStatus, setNewStatus] = useState<"todo" | "in-progress" | "done">("todo")
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = () => {
    setLoading(true)
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        if (data.tasks && data.tasks.length > 0) {
          const mapped = data.tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            status: t.status === "IN_PROGRESS" ? "in-progress" : t.status.toLowerCase(),
            priority: t.priority.toLowerCase(),
            tags: ["saved"],
          }))
          setTasks(mapped)
        } else {
          setTasks([
            { id: "demo-1", title: "Write blog post draft", description: "AI content for product launch", status: "todo", priority: "high", tags: ["content", "blog"] },
            { id: "demo-2", title: "Design social media assets", description: "Create visuals for campaign", status: "in-progress", priority: "medium", tags: ["design", "social"] },
            { id: "demo-3", title: "Review analytics report", description: "Monthly performance review", status: "done", priority: "low", tags: ["analytics"] },
          ])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setNewTitle("")
    setNewDesc("")
    setNewPriority("medium")
    setNewStatus("todo")
    setShowModal(true)
  }

  const handleOpenEditModal = (task: Task) => {
    setEditingId(task.id)
    setNewTitle(task.title)
    setNewDesc(task.description || "")
    setNewPriority(task.priority as any)
    setNewStatus(task.status as any)
    setShowModal(true)
  }

  const handleSaveTask = async () => {
    if (!newTitle.trim()) return
    setSaving(true)

    try {
      if (editingId) {
        // Edit mode
        const res = await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            title: newTitle,
            description: newDesc,
            priority: newPriority,
            status: newStatus,
          }),
        })

        if (res.ok) {
          fetchTasks()
          setShowModal(false)
        }
      } else {
        // Create mode
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle,
            description: newDesc,
            priority: newPriority,
            status: newStatus,
          }),
        })

        if (res.ok) {
          fetchTasks()
          setShowModal(false)
        }
      }
    } catch (err) {
      console.error("Failed to save task:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (id.startsWith("demo-")) {
      // Just filter local demo items
      setTasks(tasks.filter(t => t.id !== id))
      return
    }

    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchTasks()
      }
    } catch (err) {
      console.error("Failed to delete task:", err)
    }
  }

  const todoTasks = tasks.filter(t => t.status === "todo")
  const inProgressTasks = tasks.filter(t => t.status === "in-progress")
  const doneTasks = tasks.filter(t => t.status === "done")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-550 to-purple-500 bg-clip-text text-transparent">
            Workspace Tasks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tasks are saved to your account database. Manage them using List or Kanban formats.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 dark:bg-slate-850 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/55">
            <button 
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-550" : "text-slate-400"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-md transition-all ${view === "kanban" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-550" : "text-slate-400"}`}
            >
              <Kanban className="h-4 w-4" />
            </button>
          </div>
          <Button 
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Task Creation/Editing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {editingId ? "Edit Task" : "Add New Task"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">Task Title</label>
                <input
                  type="text"
                  placeholder="E.g., Finalize product campaign copywriting"
                  className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">Description</label>
                <textarea
                  placeholder="Provide more context..."
                  className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 h-20"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">Priority</label>
                  <select
                    className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none"
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">Status</label>
                  <select
                    className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none"
                    value={newStatus}
                    onChange={(e: any) => setNewStatus(e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSaveTask} disabled={saving} className="bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : editingId ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View rendering */}
      {view === "list" ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="glass-panel border border-slate-200/50 dark:border-slate-850 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckSquare className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm text-slate-800 dark:text-slate-200 ${task.status === "done" ? "line-through opacity-60" : ""}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    task.status === "done" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" :
                    task.status === "in-progress" ? "bg-amber-100 text-amber-805 dark:bg-amber-950/30 dark:text-amber-400" :
                    "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                  }`}>
                    {task.status}
                  </span>
                  <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    task.priority === "high" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-455" :
                    task.priority === "medium" ? "bg-yellow-105 text-yellow-805 dark:bg-yellow-950/30 dark:text-yellow-450" :
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {task.priority}
                  </span>
                  
                  <div className="flex items-center gap-1.5 border-l border-slate-150 dark:border-slate-800 pl-3">
                    <button 
                      onClick={() => handleOpenEditModal(task)} 
                      className="p-1 text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="p-1 text-slate-455 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Kanban Board rendering */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* To Do column */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> To Do ({todoTasks.length})
            </h2>
            <div className="space-y-3">
              {todoTasks.map(task => (
                <Card key={task.id} className="glass-panel border-slate-200/50 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750 transition-all shadow-sm">
                  <CardContent className="p-3.5 space-y-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-205">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-850">
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                        task.priority === "high" ? "bg-rose-100 text-rose-700" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleOpenEditModal(task)} className="p-1 text-slate-400 hover:text-indigo-650">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress column */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> In Progress ({inProgressTasks.length})
            </h2>
            <div className="space-y-3">
              {inProgressTasks.map(task => (
                <Card key={task.id} className="glass-panel border-slate-200/50 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750 transition-all shadow-sm">
                  <CardContent className="p-3.5 space-y-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-205">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-850">
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                        task.priority === "high" ? "bg-rose-100 text-rose-700" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleOpenEditModal(task)} className="p-1 text-slate-400 hover:text-indigo-650">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Done column */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done ({doneTasks.length})
            </h2>
            <div className="space-y-3">
              {doneTasks.map(task => (
                <Card key={task.id} className="glass-panel border-slate-200/50 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750 transition-all shadow-sm opacity-75">
                  <CardContent className="p-3.5 space-y-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-205 line-through opacity-70">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-850">
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                        task.priority === "high" ? "bg-rose-100 text-rose-700" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleOpenEditModal(task)} className="p-1 text-slate-400 hover:text-indigo-650">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}