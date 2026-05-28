"use client"

import { useState, useEffect } from "react"
import { BrandVoice } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Save, Sparkles, Loader2, BookOpen, Volume2, HelpCircle } from "lucide-react"

const defaultVoices: BrandVoice[] = [
  { id: "1", name: "Professional Corporate", tone: "formal", style: "Clear, authoritative, professional", guidelines: "Use industry terms, write in third-person, avoid casual abbreviations." },
  { id: "2", name: "Friendly & Casual", tone: "casual", style: "Conversational, warm, approachable", guidelines: "Use first-person (we/us), friendly greetings, and contractions (it's, we're)." },
  { id: "3", name: "Bold Startup", tone: "sales", style: "Energetic, persuasive, forward-looking", guidelines: "Focus on innovation, use strong active verbs, and keep paragraphs punchy." },
]

export default function BrandVoicePage() {
  const [voices, setVoices] = useState<BrandVoice[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newVoice, setNewVoice] = useState<Partial<BrandVoice>>({
    name: "",
    tone: "formal",
    style: "",
    guidelines: ""
  })
  
  // AI Voice Extractor States
  const [voiceSample, setVoiceSample] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionResult, setExtractionResult] = useState<string | null>(null)

  // Load voices from local storage or default on mount
  useEffect(() => {
    const saved = localStorage.getItem("fas26_brand_voices")
    if (saved) {
      try {
        setVoices(JSON.parse(saved))
      } catch (e) {
        setVoices(defaultVoices)
      }
    } else {
      setVoices(defaultVoices)
      localStorage.setItem("fas26_brand_voices", JSON.stringify(defaultVoices))
    }
  }, [])

  const saveVoicesToStorage = (updatedVoices: BrandVoice[]) => {
    setVoices(updatedVoices)
    localStorage.setItem("fas26_brand_voices", JSON.stringify(updatedVoices))
  }

  const handleSave = () => {
    if (!newVoice.name) return

    let updated: BrandVoice[]
    if (editingId) {
      updated = voices.map(v => v.id === editingId ? { ...v, ...newVoice } as BrandVoice : v)
      setEditingId(null)
    } else {
      const createdVoice: BrandVoice = {
        id: Date.now().toString(),
        name: newVoice.name,
        tone: newVoice.tone || "formal",
        style: newVoice.style || "Generic style",
        guidelines: newVoice.guidelines || "No custom guidelines defined."
      }
      updated = [...voices, createdVoice]
    }
    
    saveVoicesToStorage(updated)
    setNewVoice({ name: "", tone: "formal", style: "", guidelines: "" })
  }

  const handleEdit = (voice: BrandVoice) => {
    setEditingId(voice.id)
    setNewVoice(voice)
  }

  const handleDelete = (id: string) => {
    const updated = voices.filter(v => v.id !== id)
    saveVoicesToStorage(updated)
  }

  // Extract Brand Voice from Text Sample using AI
  const handleExtractVoice = async () => {
    if (!voiceSample.trim()) return
    setIsExtracting(true)
    setExtractionResult(null)

    try {
      const prompt = `Analyze this writing sample and write a structured brand voice specification. 
Respond in strict JSON format with exactly four keys:
"name": a short 2-3 word creative name for this writing style (e.g. "Direct Tech Savvy", "Warm Artisan Storyteller")
"tone": choose exactly one of: "formal", "casual", "sales", "technical"
"style": 3-5 keywords summarizing the style (e.g. "empathetic, witty, informative")
"guidelines": 2-3 sentence rules on what words to use, perspective, and style rules.

Writing sample:
"${voiceSample}"`

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: "text" })
      })

      const data = await res.json()
      if (data.success && data.result) {
        // Try parsing JSON out of AI response
        const cleanJson = data.result.replace(/```json|```/g, "").trim()
        const spec = JSON.parse(cleanJson)
        
        setNewVoice({
          name: spec.name || "AI Analyzed Voice",
          tone: spec.tone || "casual",
          style: spec.style || "clean, modern",
          guidelines: spec.guidelines || "Write naturally based on the sample."
        })
        setExtractionResult("Successfully analyzed! Review the created specs in the form on the left and hit 'Save Voice' to store it.")
      } else {
        setExtractionResult("Failed to extract brand voice parameters. Make sure your keys are configured.")
      }
    } catch (err) {
      setExtractionResult("Failed to parse AI response. Please try again with a cleaner text sample.")
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
          Brand Voice Studio
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your business voice or let the AI analyze existing texts to extract a matching communication style.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Library */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create/Edit Form */}
          <Card className="glass-panel border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-indigo-500" />
                {editingId ? "Edit Brand Voice Profile" : "Create Brand Voice Profile"}
              </CardTitle>
              <CardDescription>Define the attributes that shape how the AI drafts copy for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Voice Profile Name</label>
                  <input 
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                    value={newVoice.name || ""}
                    onChange={(e) => setNewVoice({...newVoice, name: e.target.value})}
                    placeholder="e.g., Bold Startup, Friendly Support"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Base Tone</label>
                  <select 
                    value={newVoice.tone} 
                    onChange={(e) => setNewVoice({...newVoice, tone: e.target.value as any})}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="formal">Formal & Corporate</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="sales">Sales & Persuasive</option>
                    <option value="technical">Technical & Detailed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Style Keywords</label>
                <input 
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  value={newVoice.style || ""}
                  onChange={(e) => setNewVoice({...newVoice, style: e.target.value})}
                  placeholder="e.g., clear, witty, highly energetic"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Detailed Copywriting Guidelines</label>
                <Textarea
                  value={newVoice.guidelines || ""}
                  onChange={(e) => setNewVoice({...newVoice, guidelines: e.target.value})}
                  placeholder="Tell the AI what words to avoid, whether to use emojis, how long the paragraphs should be, etc..."
                  className="min-h-24 text-sm rounded-xl focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                {editingId && (
                  <Button variant="ghost" onClick={() => {
                    setEditingId(null)
                    setNewVoice({ name: "", tone: "formal", style: "", guidelines: "" })
                  }} className="w-1/2">
                    Cancel Edit
                  </Button>
                )}
                <Button onClick={handleSave} disabled={!newVoice.name} className={`bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl ${editingId ? "w-1/2" : "w-full"}`}>
                  <Save className="h-4 w-4 mr-2" /> {editingId ? "Update Voice Profile" : "Save Voice Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Voice Library Vault */}
          <Card className="glass-panel border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Active Voice Profiles ({voices.length})
              </CardTitle>
              <CardDescription>Select any profile to modify it. Saved profiles are automatically syncable inside the AI planners.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voices.map((voice) => (
                <div key={voice.id} className="border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition-all rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs uppercase font-extrabold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        {voice.tone}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(voice)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(voice.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-2">{voice.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">"{voice.style}"</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-white/40 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    {voice.guidelines}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: AI Auto-Extractor */}
        <div className="space-y-6">
          <Card className="glass-panel border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                AI Style Extractor
              </CardTitle>
              <CardDescription>Paste your business values, email newsletters, or website copy, and AI will automatically define your tone characteristics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste some writing samples here (minimum 50 words)..."
                value={voiceSample}
                onChange={(e) => setVoiceSample(e.target.value)}
                className="min-h-48 text-xs rounded-xl focus:ring-1 focus:ring-indigo-500"
              />
              <Button 
                onClick={handleExtractVoice} 
                disabled={isExtracting || !voiceSample.trim()}
                className="w-full glow-btn bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl py-2.5 shadow-md shadow-indigo-500/20"
              >
                {isExtracting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing copywriting...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Extract Voice with AI</>
                )}
              </Button>
              {extractionResult && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs text-indigo-750 dark:text-indigo-300 rounded-xl border border-indigo-100 dark:border-indigo-900 leading-relaxed">
                  {extractionResult}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}