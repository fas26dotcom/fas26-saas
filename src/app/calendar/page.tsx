"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Loader2, 
  Sparkles, 
  FileText, 
  Calendar as CalendarIcon, 
  MessageSquare,
  Clock, 
  Smartphone, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Edit3,
  Copy
} from "lucide-react"
import { Label } from "@/components/ui/label"

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

type Event = {
  id: string
  title: string
  date: string
  time: string
  type: "meeting" | "focus" | "deadline" | "reminder" | "linkedin" | "twitter" | "instagram" | "blog"
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  
  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  
  // Standard Event Form State
  const [newTitle, setNewTitle] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])
  const [newTime, setNewTime] = useState("12:00 PM")
  const [newType, setNewType] = useState<Event["type"]>("meeting")

  // AI Campaign Creator Form State
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiPlatform, setAiPlatform] = useState<"linkedin" | "twitter" | "instagram" | "blog">("linkedin")
  const [aiTone, setAiTone] = useState("Professional")
  const [aiTime, setAiTime] = useState("09:00 AM")
  const [generatedText, setGeneratedText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activePreviewTab, setActivePreviewTab] = useState<"edit" | "preview">("edit")
  const [brandVoices, setBrandVoices] = useState<any[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editTime, setEditTime] = useState("")
  const [editType, setEditType] = useState<Event["type"]>("meeting")
  const [showEditModal, setShowEditModal] = useState(false)

  // Copy and Expansion State
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({})

  const handleCopyText = (text: string, id: string) => {
    const cleanText = text.replace(/^\[.*?\]\s*/, "")
    navigator.clipboard.writeText(cleanText)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleExpandEvent = (id: string) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post/event?")) return
    if (eventId.startsWith("demo-")) {
      setEvents(events.filter(e => e.id !== eventId))
      return
    }
    try {
      const res = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchEvents()
      } else {
        alert("Failed to delete event.")
      }
    } catch (err) {
      console.error("Error deleting event:", err)
    }
  }

  const handleStartEdit = (event: Event) => {
    setEditingEvent(event)
    setEditTitle(event.title)
    setEditDate(event.date)
    setEditTime(event.time)
    setEditType(event.type)
    setShowEditModal(true)
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editTitle.trim()) return
    if (editingEvent.id.startsWith("demo-")) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, title: editTitle, date: editDate, time: editTime, type: editType } : e))
      setShowEditModal(false)
      setEditingEvent(null)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/events?id=${editingEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          date: editDate,
          time: editTime,
          type: editType,
        }),
      })
      if (res.ok) {
        fetchEvents()
        setShowEditModal(false)
        setEditingEvent(null)
      } else {
        alert("Failed to update event.")
      }
    } catch (err) {
      console.error("Error updating event:", err)
    } finally {
      setSaving(false)
    }
  }

  // Load session, events & brand voices on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user)
        }
      })
      .catch(() => {})

    fetchEvents()

    const saved = localStorage.getItem("fas26_brand_voices")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setBrandVoices(parsed)
        if (parsed.length > 0) {
          setSelectedVoiceId(parsed[0].id)
        }
      } catch (e) {}
    }
  }, [])

  const fetchEvents = () => {
    setLoading(true)
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (data.events && data.events.length > 0) {
          setEvents(data.events)
        } else {
          // Show demo events if none saved
          const todayStr = new Date().toISOString().split("T")[0]
          setEvents([
            { id: "demo-1", title: "Team Sync & Standup", date: todayStr, time: "10:00 AM", type: "meeting" },
            { id: "demo-2", title: "[LINKEDIN] Announcement: Product Launch Day!", date: todayStr, time: "09:00 AM", type: "linkedin" },
          ])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleAddEvent = async () => {
    if (!newTitle.trim()) return
    setSaving(true)

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          date: newDate,
          time: newTime,
          type: newType,
        }),
      })

      if (res.ok) {
        fetchEvents()
        setNewTitle("")
        setShowModal(false)
      }
    } catch (err) {
      console.error("Failed to save event:", err)
    } finally {
      setSaving(false)
    }
  }

  // Handle AI Content Generation
  const handleGenerateAiCampaign = async () => {
    if (!aiPrompt.trim()) return
    setIsGenerating(true)
    setGeneratedText("")
    setActivePreviewTab("edit")

    try {
      const activeVoice = brandVoices.find(v => v.id === selectedVoiceId)
      const voiceInstructions = activeVoice 
        ? `Use the Brand Voice Profile named "${activeVoice.name}" which has tone "${activeVoice.tone}", style keywords "${activeVoice.style}", and guidelines: "${activeVoice.guidelines}".`
        : `Toned to be: ${aiTone}.`

      const finalPrompt = `Write a high-converting ${aiPlatform} post about: "${aiPrompt}". 
${voiceInstructions}
Make it engaging, well-formatted with paragraph breaks, and include 3 relevant hashtags at the bottom.`

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          type: "text"
        })
      })

      const data = await res.json()
      if (data.success && data.result) {
        setGeneratedText(data.result)
        setActivePreviewTab("preview")
      } else {
        setGeneratedText("Failed to generate content. Please verify your OpenAI or Gemini key in settings.")
      }
    } catch (err) {
      setGeneratedText("An unexpected error occurred during generation.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Schedule generated AI Campaign
  const handleScheduleAiCampaign = async () => {
    if (!generatedText.trim()) return
    setSaving(true)

    const titlePrefix = `[${aiPlatform.toUpperCase()}] `
    const fullTitle = titlePrefix + generatedText

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fullTitle,
          date: selectedDate,
          time: aiTime,
          type: aiPlatform,
        }),
      })

      if (res.ok) {
        fetchEvents()
        setShowAiModal(false)
        setAiPrompt("")
        setGeneratedText("")
      }
    } catch (err) {
      console.error("Failed to schedule campaign:", err)
    } finally {
      setSaving(false)
    }
  }

  const getEventTypeStyle = (type: Event["type"]) => {
    switch (type) {
      case "meeting": return "bg-blue-100 dark:bg-blue-950/40 text-blue-750 border-blue-200"
      case "focus": return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-750 border-emerald-200"
      case "deadline": return "bg-rose-100 dark:bg-rose-950/40 text-rose-750 border-rose-200"
      case "linkedin": return "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200"
      case "twitter": return "bg-slate-100 dark:bg-slate-900 text-slate-800 border-slate-200"
      case "instagram": return "bg-pink-50 dark:bg-pink-950/20 text-pink-600 border-pink-200"
      case "blog": return "bg-purple-100 dark:bg-purple-950/40 text-purple-750 border-purple-200"
      default: return "bg-slate-100 dark:bg-slate-900 text-slate-700 border-slate-200"
    }
  }

  const getPlatformIcon = (type: Event["type"]) => {
    switch (type) {
      case "linkedin": return <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
      case "twitter": return <TwitterIcon className="h-3.5 w-3.5 text-slate-800 dark:text-white" />
      case "instagram": return <InstagramIcon className="h-3.5 w-3.5 text-pink-500" />
      case "blog": return <FileText className="h-3.5 w-3.5 text-purple-500" />
      default: return <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const currentMonthStr = `${monthNames[month]} ${year}`

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Find events matching a specific date string (YYYY-MM-DD)
  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr)
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Marketing Planner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate, schedule, and preview social media posts directly on your content calendar.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={handlePrevMonth} className="p-2.5">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold min-w-[120px] text-center text-slate-700 dark:text-slate-300">
            {currentMonthStr}
          </span>
          <Button variant="outline" onClick={handleNextMonth} className="p-2.5">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setShowAiModal(true)} 
            className="glow-btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/25"
          >
            <Sparkles className="h-4 w-4" /> AI Planner
          </Button>
          <Button variant="outline" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Grid Calendar (Left 2 Columns) */}
        <div className="lg:col-span-2">
          <Card className="glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <CardContent className="p-5">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {/* Empty Offset cells */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="aspect-square bg-slate-50/10 rounded-xl opacity-20"></div>
                ))}
                
                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
                  const isSelected = selectedDate === dateStr
                  const dayEvents = getEventsForDate(dateStr)
                  
                  return (
                    <div 
                      key={dayNum} 
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square border rounded-2xl p-2 relative flex flex-col justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? "border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/10 dark:bg-indigo-950/20" 
                          : "border-slate-200/60 dark:border-slate-850 hover:border-slate-350 hover:bg-slate-50/20 dark:hover:bg-slate-900/10"
                      }`}
                    >
                      <span className={`text-xs font-bold ${isSelected ? "text-indigo-500 font-extrabold" : "text-slate-500 dark:text-slate-400"}`}>
                        {dayNum}
                      </span>
                      
                      {/* Platform Badges in cell */}
                      <div className="flex flex-wrap gap-1 max-h-[60%] overflow-hidden">
                        {dayEvents.map((e) => (
                          <div 
                            key={e.id} 
                            className="p-0.5 rounded-md bg-slate-100 dark:bg-slate-800"
                            title={e.title}
                          >
                            {getPlatformIcon(e.type)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Agenda (Right Column) */}
        <div className="space-y-6">
          <Card className="glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <CalendarIcon className="h-5 w-5 text-indigo-500" />
                Schedule for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </CardTitle>
              <CardDescription>View, adjust, and deploy planned publications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Clock className="h-8 w-8 mx-auto stroke-1" />
                  <p className="text-xs">No posts or events scheduled for this day.</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAiModal(true)} 
                    className="text-xs text-indigo-500 hover:text-indigo-650"
                  >
                    Draft campaign with AI
                  </Button>
                </div>
              ) : (
                selectedDateEvents.map((event) => {
                  const cleanText = event.title.replace(/^\[.*?\]\s*/, "")
                  const isExpanded = expandedEvents[event.id]
                  
                  return (
                    <div key={event.id} className={`border rounded-2xl p-4 space-y-3 shadow-sm ${getEventTypeStyle(event.type)}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(event.type)}
                          <h4 className="font-bold text-xs uppercase tracking-wider">{event.type} Campaign</h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 px-2 py-0.5 rounded-full">
                            {event.time}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleCopyText(event.title, event.id)}
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors text-slate-700 dark:text-slate-200"
                              title="Copy Full Post"
                            >
                              {copiedId === event.id ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStartEdit(event)}
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors text-slate-700 dark:text-slate-200"
                              title="Edit Event"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 rounded transition-colors text-rose-600 dark:text-rose-400"
                              title="Delete Event"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <p 
                          className={`text-xs text-slate-700 dark:text-slate-250 leading-relaxed whitespace-pre-wrap ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}
                        >
                          {cleanText}
                        </p>
                        {cleanText.length > 120 && (
                          <button
                            onClick={() => toggleExpandEvent(event.id)}
                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-750 mt-1.5 block focus:outline-none"
                          >
                            {isExpanded ? "Show Less" : "Read Full Post"}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Standard Event Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Schedule Task or Meeting</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Event Title</Label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Sync review meeting"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <input
                    id="date"
                    type="date"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time</Label>
                  <input
                    id="time"
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Category</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                >
                  <option value="meeting">Meeting</option>
                  <option value="focus">Focus Session</option>
                  <option value="deadline">Project Deadline</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleAddEvent} disabled={saving} className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl">
                  {saving ? "Scheduling..." : "Schedule Event"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Marketing Campaign Creator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-4xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
            >
              Close
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Marketing Planner</h3>
                <p className="text-xs text-slate-500">Draft, optimize, and schedule platform-specific social campaigns instantly</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Form Settings */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ai-prompt">What is this campaign about? (Prompt)</Label>
                  <textarea
                    id="ai-prompt"
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Announce our startup launch on Vercel with free trials..."
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ai-platform">Target Channel</Label>
                    <select
                      id="ai-platform"
                      value={aiPlatform}
                      onChange={(e: any) => setAiPlatform(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none"
                    >
                      <option value="linkedin">LinkedIn Update</option>
                      <option value="twitter">X / Twitter Thread</option>
                      <option value="instagram">Instagram Caption</option>
                      <option value="blog">Blog Article Outline</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ai-tone">Brand Voice Profile</Label>
                    <select
                      id="ai-tone"
                      value={selectedVoiceId}
                      onChange={(e) => setSelectedVoiceId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none"
                    >
                      {brandVoices.length > 0 ? (
                        brandVoices.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="default-corp">Corporate Professional</option>
                          <option value="default-casual">Friendly & Casual</option>
                          <option value="default-bold">Bold Startup</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ai-time">Schedule Publishing Time</Label>
                  <input
                    id="ai-time"
                    type="text"
                    value={aiTime}
                    onChange={(e) => setAiTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                  />
                </div>

                <Button 
                  onClick={handleGenerateAiCampaign} 
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full glow-btn bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl py-2.5 font-bold"
                >
                  {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Writing Content...</> : "Generate Draft with AI"}
                </Button>
              </div>

              {/* Right Column: Editor & Mobile Feed Mockup Preview */}
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex border-b border-slate-200 dark:border-slate-850 mb-3">
                    <button
                      onClick={() => setActivePreviewTab("edit")}
                      className={`pb-2 text-xs font-bold border-b-2 px-4 transition-all ${
                        activePreviewTab === "edit" ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-500"
                      }`}
                    >
                      Raw Editor
                    </button>
                    <button
                      onClick={() => setActivePreviewTab("preview")}
                      disabled={!generatedText}
                      className={`pb-2 text-xs font-bold border-b-2 px-4 transition-all ${
                        activePreviewTab === "preview" ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-500 disabled:opacity-50"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5 inline mr-1" /> Mobile Feed Preview
                    </button>
                  </div>

                  {activePreviewTab === "edit" ? (
                    <textarea
                      rows={10}
                      value={generatedText}
                      onChange={(e) => setGeneratedText(e.target.value)}
                      placeholder="Your generated campaign copy will appear here for editing..."
                      className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-sans"
                    />
                  ) : (
                    /* FEED PREVIEWS */
                    <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex justify-center">
                      
                      {/* LinkedIn Card */}
                      {aiPlatform === "linkedin" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 w-full max-w-sm text-slate-900 dark:text-slate-100 space-y-3 font-sans shadow-sm text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {user ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="text-xs font-bold">{user ? user.name : "Your Account"}</p>
                              <p className="text-[10px] text-slate-500">Founder & CEO @ FAS26</p>
                            </div>
                          </div>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">{generatedText}</p>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between text-slate-500 text-[10px] font-bold">
                            <span>👍 Like</span>
                            <span>💬 Comment</span>
                            <span>🔁 Repost</span>
                            <span>✉ Send</span>
                          </div>
                        </div>
                      )}

                      {/* X / Twitter Post */}
                      {aiPlatform === "twitter" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 w-full max-w-sm text-slate-900 dark:text-slate-100 space-y-3 font-sans shadow-sm text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {user ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold">{user ? user.name : "Your Account"}</p>
                              <p className="text-[10px] text-slate-500">@fas26_hq</p>
                            </div>
                          </div>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">{generatedText}</p>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between text-slate-500 text-xs">
                            <span>💬 0</span>
                            <span>🔁 0</span>
                            <span>♥ 0</span>
                            <span>📊 0</span>
                          </div>
                        </div>
                      )}

                      {/* Instagram Caption */}
                      {aiPlatform === "instagram" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm text-slate-900 dark:text-slate-100 font-sans shadow-sm text-left overflow-hidden">
                          <div className="flex items-center gap-2 p-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {user ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <p className="text-xs font-bold">{user ? user.name : "your_account"}</p>
                          </div>
                          <div className="aspect-video bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 border-y border-slate-100 dark:border-slate-800 flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-indigo-500/40 animate-pulse" />
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="flex gap-3 text-slate-800 dark:text-slate-200">
                              <span>♥</span>
                              <span>💬</span>
                              <span>✉</span>
                            </div>
                            <p className="text-xs leading-relaxed">
                              <span className="font-bold mr-1.5">{user ? user.name.toLowerCase().replace(/\s+/g, "") : "your_account"}</span>
                              {generatedText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Blog Outline */}
                      {aiPlatform === "blog" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 w-full max-w-sm text-slate-900 dark:text-slate-100 space-y-4 font-serif shadow-sm text-left">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded-full">Draft Article Outline</span>
                            <h4 className="text-base font-extrabold font-sans">Title: {aiPrompt}</h4>
                          </div>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed font-sans">{generatedText}</p>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <Button variant="ghost" onClick={() => setShowAiModal(false)} className="w-1/2">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleScheduleAiCampaign} 
                    disabled={saving || !generatedText} 
                    className="w-1/2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl"
                  >
                    {saving ? "Scheduling..." : "Schedule Campaign"}
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Scheduled Post / Event</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Content / Title</Label>
                <textarea
                  id="edit-title"
                  rows={4}
                  placeholder="e.g. Sync review meeting"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-date">Date</Label>
                  <input
                    id="edit-date"
                    type="date"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-time">Time</Label>
                  <input
                    id="edit-time"
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-type">Category / Platform</Label>
                <select
                  id="edit-type"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-250"
                  value={editType}
                  onChange={(e: any) => setEditType(e.target.value)}
                >
                  <option value="meeting">Meeting</option>
                  <option value="focus">Focus Session</option>
                  <option value="deadline">Project Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="linkedin">LinkedIn Update</option>
                  <option value="twitter">X / Twitter Post</option>
                  <option value="instagram">Instagram Caption</option>
                  <option value="blog">Blog Outline</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => { setShowEditModal(false); setEditingEvent(null); }}>Cancel</Button>
                <Button onClick={handleUpdateEvent} disabled={saving} className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}