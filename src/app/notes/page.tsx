"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Search, Tag, Loader2, Edit2, Trash2 } from "lucide-react"

type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newTagsStr, setNewTagsStr] = useState("")

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = () => {
    setLoading(true)
    fetch("/api/notes")
      .then(res => res.json())
      .then(data => {
        if (data.notes && data.notes.length > 0) {
          const mapped = data.notes.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content || "",
            tags: n.tags || [],
            updatedAt: new Date(n.updatedAt).toLocaleDateString(),
          }))
          setNotes(mapped)
        } else {
          setNotes([
            { id: "demo-1", title: "Project Kickoff", content: "Meeting notes from project kickoff session...", tags: ["meeting", "project"], updatedAt: "2 hours ago" },
            { id: "demo-2", title: "Content Strategy", content: "Q3 content strategy guidelines...", tags: ["content", "strategy"], updatedAt: "1 day ago" },
            { id: "demo-3", title: "API Documentation", content: "REST API endpoints reference...", tags: ["docs", "api"], updatedAt: "3 days ago" },
          ])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setNewTitle("")
    setNewContent("")
    setNewTagsStr("")
    setShowModal(true)
  }

  const handleOpenEditModal = (note: Note) => {
    setEditingId(note.id)
    setNewTitle(note.title)
    setNewContent(note.content)
    setNewTagsStr(note.tags.join(", "))
    setShowModal(true)
  }

  const handleSaveNote = async () => {
    if (!newTitle.trim()) return
    setSaving(true)

    const tagsArr = newTagsStr.split(",").map(t => t.trim()).filter(Boolean)

    try {
      if (editingId) {
        // Edit mode
        const res = await fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            title: newTitle,
            content: newContent,
            tags: tagsArr,
          }),
        })

        if (res.ok) {
          fetchNotes()
          setShowModal(false)
        }
      } else {
        // Create mode
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle,
            content: newContent,
            tags: tagsArr,
          }),
        })

        if (res.ok) {
          fetchNotes()
          setShowModal(false)
        }
      }
    } catch (err) {
      console.error("Failed to save note:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (id.startsWith("demo-")) {
      setNotes(notes.filter(n => n.id !== id))
      return
    }

    try {
      const res = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error("Failed to delete note:", err)
    }
  }

  // Get all unique tags for filter dropdown
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)))

  const filteredNotes = notes.filter(note => 
    (searchQuery ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) : true) &&
    (selectedTag ? note.tags.includes(selectedTag) : true)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 max-w-7xl mx-auto relative animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-550 to-purple-500 bg-clip-text text-transparent">
            Notes & Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, tag, and organize custom notes saved securely to your account database.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      {/* Note Creation/Editing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {editingId ? "Edit Note" : "Create New Note"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">Note Title</label>
                <input
                  type="text"
                  placeholder="E.g., Design systems guidelines"
                  className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">Note Content</label>
                <textarea
                  placeholder="Write note body..."
                  className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 h-28"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="E.g., meeting, idea, drafting"
                  className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSaveNote} disabled={saving} className="bg-indigo-600 hover:bg-indigo-755 text-white font-bold rounded-xl">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : editingId ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search notes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select 
          className="px-3.5 py-2 border border-slate-250 dark:border-slate-850 bg-white dark:bg-slate-950 text-sm rounded-xl focus:outline-none text-slate-700 dark:text-slate-250"
          value={selectedTag || ""}
          onChange={(e) => setSelectedTag(e.target.value || null)}
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Grid of note cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="glass-panel border border-slate-200/50 dark:border-slate-850 hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all flex flex-col justify-between p-5 space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{note.title}</h3>
                <div className="flex items-center gap-1.5 ml-2">
                  <button 
                    onClick={() => handleOpenEditModal(note)} 
                    className="p-1 text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(note.id)} 
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-850/60">
              <div className="flex flex-wrap gap-1 max-w-[70%]">
                {note.tags.map(tag => (
                  <span key={tag} className="text-[9px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-605 dark:text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Tag className="h-2 w-2" /> {tag}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">{note.updatedAt}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}