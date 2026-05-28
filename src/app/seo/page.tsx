"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Copy, Sparkles, CheckCircle2, AlertCircle, Laptop, Smartphone, HelpCircle, ArrowRight, Loader2 } from "lucide-react"

type KeywordStat = {
  keyword: string
  count: number
  density: number // percentage
  status: "optimal" | "stuffed" | "low"
}

export default function SEOPage() {
  const [content, setContent] = useState("")
  const [targetKeywords, setTargetKeywords] = useState("content marketing, AI tools, SaaS platform")
  const [keywordStats, setKeywordStats] = useState<KeywordStat[]>([])
  
  // SEO Metrics
  const [readabilityScore, setReadabilityScore] = useState<number>(0)
  const [metaTags, setMetaTags] = useState({ 
    title: "Revolutionize Your Workflow with Advanced AI Tools", 
    description: "Discover the best SaaS platform for content marketing and automated writing. Boost your productivity today.", 
    url: "https://yourdomain.com/blog/ai-productivity-tools"
  })

  // UI States
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Real-time analysis of content length & readability score calculation
  useEffect(() => {
    if (!content.trim()) {
      setReadabilityScore(0)
      setKeywordStats([])
      return
    }

    // Rough Readability Estimate (Flesch-Kincaid proxy)
    const words = content.trim().split(/\s+/).length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1
    const characters = content.replace(/\s+/g, "").length
    
    // Average sentence length
    const asl = words / sentences
    // Average syllables proxy (based on char length / word length ratio)
    const syllablesProxy = (characters / words) * 0.4
    
    // Calculate mock readability score based on sentence complexity
    const score = Math.max(10, Math.min(100, Math.round(100 - (asl * 1.2) - (syllablesProxy * 12))))
    setReadabilityScore(score)

    // Calculate Keyword Density
    const cleanText = content.toLowerCase()
    const kwList = targetKeywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean)
    
    const stats: KeywordStat[] = kwList.map(kw => {
      // Escape special characters for regex
      const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      const matches = cleanText.match(new RegExp(`\\b${escapedKw}\\b`, 'gi'))
      const count = matches ? matches.length : 0
      const density = words > 0 ? (count / words) * 100 : 0
      
      let status: KeywordStat["status"] = "low"
      if (density > 2.5) {
        status = "stuffed"
      } else if (density >= 0.8) {
        status = "optimal"
      }

      return { keyword: kw, count, density: Math.round(density * 100) / 100, status }
    })

    setKeywordStats(stats)
  }, [content, targetKeywords])

  // Run full AI-powered Meta Optimization
  const handleAiRefine = async () => {
    if (!content.trim()) return
    setIsRefining(true)

    try {
      const prompt = `Analyze this blog post article and write the absolute best search-engine optimized Title and Meta Description for Google Search to maximize organic click-through rates.
Return strictly in JSON format with exactly two keys:
"title": under 60 characters, highly clickable and containing core keywords.
"description": under 155 characters, summarizes the value proposition with a clear call-to-action.

Article text:
"${content.substring(0, 1500)}"`

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: "text" })
      })

      const data = await res.json()
      if (data.success && data.result) {
        const cleanJson = data.result.replace(/```json|```/g, "").trim()
        const meta = JSON.parse(cleanJson)
        setMetaTags(prev => ({
          ...prev,
          title: meta.title || prev.title,
          description: meta.description || prev.description
        }))
      }
    } catch (e) {
      console.error("AI refinement failed:", e)
    } finally {
      setIsRefining(false)
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
          SEO & Content Audit Studio
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Optimize readability, track target keyword density, and preview live Google Search snippets side-by-side.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Columns: Editor & Keywords (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          <Card className="glass-panel border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Content Editor</CardTitle>
              <CardDescription>Paste your draft below to run automatic SEO metrics validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-450">Target Keywords (comma separated)</label>
                <Input 
                  value={targetKeywords} 
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  placeholder="e.g. content marketing, AI tools, SaaS platform"
                  className="rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-450">Article / Post Content</label>
                <Textarea
                  placeholder="Type or paste your content here (the analyzer checks keyword density and reading difficulty in real time)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[350px] text-sm rounded-xl focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Keyword Density Analysis */}
          <Card className="glass-panel border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Real-time Keyword Metrics</CardTitle>
              <CardDescription>Target a healthy density between 0.8% and 2.5% to avoid keyword stuffing penalties.</CardDescription>
            </CardHeader>
            <CardContent>
              {keywordStats.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Enter target keywords and paste text to see stats</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-450 dark:text-slate-400 font-bold uppercase">
                        <th className="py-2.5">Keyword</th>
                        <th className="py-2.5 text-center">Frequencies</th>
                        <th className="py-2.5 text-center">Density</th>
                        <th className="py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywordStats.map((stat, i) => (
                        <tr key={i} className="border-b border-slate-50/50 dark:border-slate-850/40">
                          <td className="py-3 font-semibold text-slate-800 dark:text-slate-205">{stat.keyword}</td>
                          <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{stat.count} times</td>
                          <td className="py-3 text-center">
                            <div className="inline-flex items-center gap-1.5 font-bold">
                              <span>{stat.density}%</span>
                              <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    stat.status === "optimal" ? "bg-emerald-500" :
                                    stat.status === "stuffed" ? "bg-rose-500" : "bg-blue-400"
                                  }`} 
                                  style={{ width: `${Math.min(100, stat.density * 25)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                              stat.status === "optimal" ? "bg-emerald-100 text-emerald-805 dark:bg-emerald-950/30 dark:text-emerald-400" :
                              stat.status === "stuffed" ? "bg-rose-100 text-rose-805 dark:bg-rose-950/30 dark:text-rose-455" :
                              "bg-blue-50 text-blue-750 dark:bg-slate-850 dark:text-slate-400"
                            }`}>
                              {stat.status === "optimal" ? "Optimal (0.8%-2.5%)" :
                               stat.status === "stuffed" ? "Stuffed (Too high)" : "Low (Optimize)"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Columns: Readability & Live SERP simulator (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Readability & Content Score */}
          <Card className="glass-panel border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Content Health Rating</CardTitle>
              <CardDescription>Analyzing syntax structure, paragraph length, and clarity indices</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6 text-center">
              
              {/* Visual Score Ring */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                  <circle 
                    cx="55" cy="50" r="40" 
                    className="stroke-slate-100 dark:stroke-slate-800 fill-none" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-emerald-500 fill-none transition-all duration-500" 
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * readabilityScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{readabilityScore}</span>
                  <span className="text-[10px] text-slate-450 uppercase font-bold">Health Score</span>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {readabilityScore >= 80 ? "Excellent Readability" :
                   readabilityScore >= 60 ? "Good Readability" :
                   readabilityScore >= 40 ? "Needs Simplification" : "Write some content to start"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {readabilityScore >= 80 ? "Easy to understand. Good sentence length and simple, direct vocabulary." :
                   readabilityScore >= 60 ? "Clear content layout. Accessible to most high-school level readers." :
                   readabilityScore >= 40 ? "Sentences are too wordy. Try splitting complex paragraphs." : 
                   "Please enter content in the editor to calculate the readability index."}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Pixel Perfect Google SERP Preview */}
          <Card className="glass-panel border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold">Google SERP Simulator</CardTitle>
                  <CardDescription>Live search preview as displayed in organic rankings</CardDescription>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-850 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/55">
                  <button 
                    onClick={() => setSerpDevice("desktop")}
                    className={`p-1.5 rounded-md transition-all ${serpDevice === "desktop" ? "bg-white dark:bg-slate-900 shadow-sm text-emerald-500" : "text-slate-400"}`}
                  >
                    <Laptop className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setSerpDevice("mobile")}
                    className={`p-1.5 rounded-md transition-all ${serpDevice === "mobile" ? "bg-white dark:bg-slate-900 shadow-sm text-emerald-500" : "text-slate-400"}`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Google Search Result Block */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-left">
                <div className={serpDevice === "mobile" ? "max-w-[340px]" : "w-full"}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200/50 dark:border-slate-700">
                      G
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-800 dark:text-slate-300 font-sans leading-none">Your Website</span>
                      <span className="text-[9px] text-slate-400 font-sans mt-0.5 truncate">{metaTags.url}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] font-sans hover:underline cursor-pointer leading-tight line-clamp-2">
                    {metaTags.title || "Please specify a page title"}
                  </h3>
                  <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] font-sans leading-relaxed mt-1 line-clamp-3">
                    {metaTags.description || "Enter a compelling meta description to improve click-through rates."}
                  </p>
                </div>
              </div>

              {/* Edit Meta Fields */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">SEO Title ({metaTags.title.length}/60 chars)</label>
                    <button 
                      onClick={() => handleCopy(metaTags.title, "title")}
                      className="text-[10px] font-bold text-slate-400 hover:text-emerald-500"
                    >
                      {copiedField === "title" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <Input 
                    value={metaTags.title} 
                    onChange={(e) => setMetaTags({...metaTags, title: e.target.value})}
                    className="text-xs rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Meta Description ({metaTags.description.length}/155 chars)</label>
                    <button 
                      onClick={() => handleCopy(metaTags.description, "desc")}
                      className="text-[10px] font-bold text-slate-400 hover:text-emerald-500"
                    >
                      {copiedField === "desc" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <Textarea 
                    value={metaTags.description} 
                    onChange={(e) => setMetaTags({...metaTags, description: e.target.value})}
                    className="text-xs rounded-xl focus:ring-1 focus:ring-emerald-500 min-h-20"
                  />
                </div>
              </div>

              {/* AI Refiner Button */}
              <Button 
                onClick={handleAiRefine} 
                disabled={isRefining || !content.trim()}
                className="w-full glow-btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl py-2"
              >
                {isRefining ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Optimizing Meta CTR...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Optimize Meta Tags with AI</>
                )}
              </Button>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}