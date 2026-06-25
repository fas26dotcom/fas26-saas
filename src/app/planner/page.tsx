"use client"

import { useState, useEffect } from "react"
import { 
  CalendarRange, 
  Sparkles, 
  ChevronRight, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  ArrowRight,
  Calendar,
  AlertCircle
} from "lucide-react"

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

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface PlanItem {
  day: number
  date: string
  time: string
  title: string
  postContent: string
  imagePrompt: string
  generatedImageUrl?: string
  isGeneratingImage?: boolean
  isPublishing?: boolean
  publishedLink?: string
  isScheduling?: boolean
  isScheduled?: boolean
}

export default function PlannerPage() {
  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("linkedin")
  const [audience, setAudience] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [plan, setPlan] = useState<PlanItem[]>([])
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [duration, setDuration] = useState("10")

  // Integration states
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [linkedinName, setLinkedinName] = useState("")
  const [isSimulated, setIsSimulated] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)

  // Fetch LinkedIn connection status on mount
  useEffect(() => {
    fetch("/api/auth/linkedin/status")
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          setLinkedinConnected(true)
          setLinkedinName(data.personName)
          setIsSimulated(data.isSimulated)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false))
  }, [])

  const handleDisconnectLinkedin = async () => {
    try {
      await fetch("/api/auth/linkedin/status", { method: "DELETE" })
      setLinkedinConnected(false)
      setLinkedinName("")
      setIsSimulated(false)
    } catch {
      alert("Failed to disconnect LinkedIn account.")
    }
  }

  const handlePublishToLinkedIn = async (index: number) => {
    setPlan(prevPlan => {
      const newPlan = [...prevPlan]
      newPlan[index] = { ...newPlan[index], isPublishing: true }
      return newPlan
    })

    try {
      const item = plan[index]
      const response = await fetch("/api/generate/planner/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent: item.postContent,
          imageUrl: item.generatedImageUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to publish post")
        setPlan(prevPlan => {
          const newPlan = [...prevPlan]
          newPlan[index] = { ...newPlan[index], isPublishing: false }
          return newPlan
        })
        return
      }

      setPlan(prevPlan => {
        const newPlan = [...prevPlan]
        newPlan[index] = { 
          ...newPlan[index], 
          isPublishing: false, 
          publishedLink: data.link || "https://www.linkedin.com/feed/"
        }
        return newPlan
      })
    } catch {
      alert("Failed to connect to publishing API.")
      setPlan(prevPlan => {
        const newPlan = [...prevPlan]
        newPlan[index] = { ...newPlan[index], isPublishing: false }
        return newPlan
      })
    }
  }

  const handleSchedulePost = async (index: number) => {
    setPlan(prevPlan => {
      const newPlan = [...prevPlan]
      newPlan[index] = { ...newPlan[index], isScheduling: true }
      return newPlan
    })

    try {
      const item = plan[index]
      const response = await fetch("/api/generate/planner/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent: item.postContent,
          imageUrl: item.generatedImageUrl,
          date: item.date,
          time: item.time,
          platform
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to schedule post")
        setPlan(prevPlan => {
          const newPlan = [...prevPlan]
          newPlan[index] = { ...newPlan[index], isScheduling: false }
          return newPlan
        })
        return
      }

      setPlan(prevPlan => {
        const newPlan = [...prevPlan]
        newPlan[index] = { 
          ...newPlan[index], 
          isScheduling: false, 
          isScheduled: true
        }
        return newPlan
      })
    } catch {
      alert("Failed to connect to scheduling API.")
      setPlan(prevPlan => {
        const newPlan = [...prevPlan]
        newPlan[index] = { ...newPlan[index], isScheduling: false }
        return newPlan
      })
    }
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    setErrorMsg("")
    setSuccessMsg("")
    setPlan([])
    
    try {
      const response = await fetch("/api/generate/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, audience, startDate, duration }),
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setErrorMsg(data.error || "Failed to generate your campaign planner")
        return
      }
      
      setPlan(data.plan || [])
      setSuccessMsg("Campaign successfully generated and scheduled to your Calendar!")
    } catch {
      setErrorMsg("An unexpected connection error occurred. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImageForDay = async (index: number) => {
    // Set loading state for this specific card
    setPlan(prevPlan => {
      const newPlan = [...prevPlan]
      newPlan[index] = { ...newPlan[index], isGeneratingImage: true }
      return newPlan
    })

    try {
      const item = plan[index]
      const responseUrl = `/api/image-render?prompt=${encodeURIComponent(item.imagePrompt)}&seed=${Math.floor(Math.random() * 1000000)}`
      
      // Prefetch to verify it loads correctly
      const imgRes = await fetch(responseUrl)
      if (!imgRes.ok) throw new Error("Failed to render image")

      setPlan(prevPlan => {
        const newPlan = [...prevPlan]
        newPlan[index] = { 
          ...newPlan[index], 
          generatedImageUrl: responseUrl, 
          isGeneratingImage: false 
        }
        return newPlan
      })
    } catch {
      alert("Failed to generate image. Please try again.")
      setPlan(prevPlan => {
        const newPlan = [...prevPlan]
        newPlan[index] = { ...newPlan[index], isGeneratingImage: false }
        return newPlan
      })
    }
  }

  const handleUpdatePostContent = (index: number, newContent: string) => {
    setPlan(prevPlan => {
      const newPlan = [...prevPlan]
      newPlan[index] = { ...newPlan[index], postContent: newContent }
      return newPlan
    })
  }

  const getPlatformIcon = (plat: string) => {
    switch (plat.toLowerCase()) {
      case "linkedin":
        return <LinkedinIcon className="h-5 w-5 text-[#0A66C2]" />
      case "twitter":
      case "x":
        return <TwitterIcon className="h-5 w-5 text-sky-500" />
      case "instagram":
        return <InstagramIcon className="h-5 w-5 text-pink-500" />
      case "facebook":
        return <FacebookIcon className="h-5 w-5 text-blue-600" />
      default:
        return <Sparkles className="h-5 w-5 text-indigo-500" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Header section with glassmorphism */}
      <div className="relative rounded-3xl p-6 md:p-8 mb-8 overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-150/20 dark:border-indigo-950/20 backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CalendarRange className="h-32 w-32 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5 animate-spin" /> Free Unlimited Planner
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            30-Day Batch Social Planner
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
            Generate an entire month of social media content automatically. Simply enter your topic, target audience, and select a platform. The planner writes all copy, maps out optimal scheduling dates on your calendar, and generates matching high-quality AI images.
          </p>
        </div>
      </div>

      {/* LinkedIn Integration Status Banner */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-[#0A66C2]">
            <LinkedinIcon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">LinkedIn Integration</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {loadingStatus ? "Checking status..." : 
               linkedinConnected ? `Connected as ${linkedinName} ${isSimulated ? "(Simulated Dev Mode)" : ""}` : "Connect your LinkedIn profile to publish posts instantly."}
            </p>
          </div>
        </div>
        <div>
          {loadingStatus ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-405" />
          ) : linkedinConnected ? (
            <Button 
              variant="outline" 
              onClick={handleDisconnectLinkedin}
              className="text-xs font-semibold text-rose-500 border-rose-250 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
            >
              Disconnect Account
            </Button>
          ) : (
            <Button 
              onClick={() => window.location.href = "/api/auth/linkedin"}
              className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              Connect LinkedIn
            </Button>
          )}
        </div>
      </div>

      {/* Input panel & scheduler settings */}
      {plan.length === 0 && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-sm backdrop-blur-md">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-indigo-500" /> Campaign Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Topic or Campaign Theme</label>
              <input
                type="text"
                placeholder="e.g. AI tools for realtors, organic skincare routines, tax filing tips"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target Audience</label>
              <input
                type="text"
                placeholder="e.g. Startup founders, freelance designers, busy moms"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Social Media Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-full h-11 rounded-xl">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">X / Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Campaign Length</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full h-11 rounded-xl">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days Campaign</SelectItem>
                  <SelectItem value="10">10 Days Campaign (Recommended)</SelectItem>
                  <SelectItem value="15">15 Days Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {errorMsg && (
            <div className="mt-6 p-4 rounded-xl text-sm text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 flex items-center gap-2 font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating || !topic}
            className="w-full mt-8 py-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 text-base transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating your campaign content...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate & Schedule Campaign
              </>
            )}
          </Button>

        </div>
      )}

      {/* Loading state with creative animation */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 text-center backdrop-blur-sm animate-pulse">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Content Specialist at Work</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-sm">
            We are generating 30 optimized social posts, writing detailed prompts, and scheduling them into your workspace calendar. Please stay on this page.
          </p>
        </div>
      )}

      {/* 30-Day campaign feed view */}
      {plan.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-4 gap-4">
            <div>
              <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 text-base">
                <Check className="h-5 w-5" /> Campaign Successfully Created!
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300/80 mt-1">
                Your 30 posts are generated and saved onto your calendar. Click below to view the interactive schedule.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setPlan([])}
                variant="outline"
                className="text-xs font-semibold py-2 px-4 rounded-xl"
              >
                Create Another Plan
              </Button>
              <Button 
                onClick={() => window.location.href = "/calendar"}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Calendar className="h-4 w-4" /> Go to Calendar <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {plan.map((item, idx) => (
              <div 
                key={item.day} 
                className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-6 relative group"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold px-3 py-1 rounded-full border border-indigo-500/10">
                        Day {item.day}
                      </span>
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {item.date} at {item.time}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                      {getPlatformIcon(platform)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Post Copy</label>
                    <Textarea 
                      value={item.postContent} 
                      onChange={(e) => handleUpdatePostContent(idx, e.target.value)}
                      className="min-h-24 bg-slate-50/50 dark:bg-slate-950/20 text-sm leading-relaxed border-slate-200/60 dark:border-slate-800/60 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-4 md:pt-0 gap-4 shrink-0">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 text-slate-400" /> Matching Image (Pollinations AI)
                    </label>
                    
                    {item.generatedImageUrl ? (
                      <div className="relative rounded-xl overflow-hidden shadow-inner border border-slate-200/60 dark:border-slate-800/60">
                        <img 
                          src={item.generatedImageUrl} 
                          alt={`Generated graphic for Day ${item.day}`}
                          className="w-full h-40 object-cover object-center rounded-xl"
                        />
                        <button 
                          onClick={() => handleGenerateImageForDay(idx)}
                          className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-colors"
                        >
                          <Sparkles className="h-3 w-3" /> Regenerate
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-850 h-40 bg-slate-50/50 dark:bg-slate-950/10 flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 mb-3 line-clamp-3">
                          {item.imagePrompt}
                        </p>
                        <Button 
                          onClick={() => handleGenerateImageForDay(idx)}
                          disabled={item.isGeneratingImage}
                          className="bg-indigo-600 hover:bg-indigo-750 text-white font-semibold text-xs py-1.5 px-3 h-8 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition"
                        >
                          {item.isGeneratingImage ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Generate Graphic
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-gray-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                    💡 Post is fully synchronized to your primary calendar.
                  </div>

                  {linkedinConnected && (
                    <div className="mt-3 space-y-2">
                      {item.publishedLink ? (
                        <a 
                          href={item.publishedLink}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Check className="h-4 w-4" /> View Post on LinkedIn ↗
                        </a>
                      ) : item.isScheduled ? (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5">
                          <Check className="h-4 w-4" /> Scheduled: {item.date} at {item.time}
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={() => handlePublishToLinkedIn(idx)}
                            disabled={item.isPublishing || item.isScheduling}
                            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 transition"
                          >
                            {item.isPublishing ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              <>
                                <LinkedinIcon className="h-4 w-4" />
                                Publish to LinkedIn Now
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleSchedulePost(idx)}
                            disabled={item.isPublishing || item.isScheduling}
                            variant="outline"
                            className="w-full border-indigo-500/30 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                          >
                            {item.isScheduling ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Scheduling...
                              </>
                            ) : (
                              <>
                                <Calendar className="h-4 w-4" />
                                Schedule Post ({item.time})
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Onboarding & User Guide section */}
      {plan.length === 0 && (
        <div className="mt-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8">
          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" /> User Setup & Posting Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">1</span>
              <h4 className="font-bold text-gray-900 dark:text-white">Connect LinkedIn</h4>
              <p className="text-xs">
                Click <strong>Connect LinkedIn</strong> in the status bar. This authenticates you securely using OAuth. (No API keys needed on your end).
              </p>
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">2</span>
              <h4 className="font-bold text-gray-900 dark:text-white">Set Your Topic</h4>
              <p className="text-xs">
                Enter your niche, platform, and preferred start date. Choose a plan duration of 7, 10, or 15 days, and click <strong>Generate</strong>.
              </p>
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">3</span>
              <h4 className="font-bold text-gray-900 dark:text-white">Generate AI Graphics</h4>
              <p className="text-xs">
                For each day's post, review the generated copy. Click <strong>Generate Graphic</strong> to automatically create matching artwork.
              </p>
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">4</span>
              <h4 className="font-bold text-gray-900 dark:text-white">Publish Instantly</h4>
              <p className="text-xs">
                Click <strong>Publish to LinkedIn Now</strong> to immediately share the post onto your live feed, or view them scheduled on your main Calendar.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
