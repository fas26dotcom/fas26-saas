"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentTemplate } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

const templates: ContentTemplate[] = [
  { id: "1", name: "Blog Post", category: "blog", description: "SEO-optimized blog article", prompt: "Write a comprehensive blog post about {topic} targeting {audience}. Include introduction, main sections with subheadings, and conclusion." },
  { id: "2", name: "Social Media Caption", category: "social", description: "Engaging social media post", prompt: "Create a catchy {platform} caption for {topic} with relevant hashtags." },
  { id: "3", name: "Product Description", category: "product", description: "Compelling product copy", prompt: "Write a persuasive product description for {product} highlighting key features and benefits." },
  { id: "4", name: "Newsletter", category: "newsletter", description: "Email newsletter content", prompt: "Create a newsletter email about {topic} with engaging subject line and call-to-action." },
  { id: "5", name: "Video Script", category: "video-script", description: "Video content script", prompt: "Write a video script for {topic} including intro, main points, and outro." },
]

export default function ContentPage() {
  const [prompt, setPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("text")

  // Isolated states to avoid cross-render clashes
  const [generatedText, setGeneratedText] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [generatedVideo, setGeneratedVideo] = useState("")
  const [generatedAudio, setGeneratedAudio] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const handleGenerate = async () => {
    setIsGenerating(true)
    setErrorMsg("")
    try {
      const response = await fetch(`/api/generate?t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ prompt, type: activeTab }),
      })
      const data = await response.json()
      
      if (!data.success) {
        setErrorMsg(data.error || "Failed to generate content")
        return
      }
      
      // Route the output to the correct isolated state
      if (activeTab === "text") setGeneratedText(data.result || "")
      if (activeTab === "image") setGeneratedImage(data.result || "")
      if (activeTab === "video") setGeneratedVideo(data.result || "")
      if (activeTab === "audio") setGeneratedAudio(data.result || "")

    } catch {
      setErrorMsg("An unexpected connection error occurred.")
      if (activeTab === "text") setGeneratedText("Error generating content")
      if (activeTab === "image") setGeneratedImage("")
      if (activeTab === "video") setGeneratedVideo("")
      if (activeTab === "audio") setGeneratedAudio("")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Content Generation</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Generate text, images, videos, and audio from a single interface</p>

      <Tabs defaultValue="text" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompt</label>
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32"
            />
            {activeTab === "audio" && (
              <div className="mt-2 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 bg-indigo-50/30 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 animate-in fade-in duration-200">
                <span>
                  💡 <strong>Voiceover Limit</strong>: Up to 200 characters (~15-20 seconds) in Free tier.
                </span>
                <span className={prompt.length > 200 ? "text-rose-500 font-bold animate-pulse" : "font-medium"}>
                  {prompt.length} / 200 chars
                </span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt}
          className="mb-6"
        >
          {isGenerating ? "Generating..." : "Generate Content"}
        </Button>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-sm font-semibold text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 flex items-center gap-2">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        <TabsContent value="text" className="w-full">
          <div className="border rounded-xl p-6 min-h-64 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200/55 dark:border-slate-800/45">
            <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {generatedText || "Generated text content will appear here..."}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="w-full">
          <div className="border rounded-xl p-6 min-h-64 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200/55 dark:border-slate-800/45 flex items-center justify-center">
            {generatedImage ? (
              <div className="flex flex-col items-center gap-4">
                <img 
                  src={generatedImage} 
                  alt="Generated asset" 
                  className="max-w-full max-h-[400px] rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 object-contain"
                />
                <a 
                  href={generatedImage} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-indigo-500 hover:underline font-semibold"
                >
                  Open High-Res Image ↗
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Generated image will appear here</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="video" className="w-full">
          <div className="border rounded-xl p-6 min-h-64 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200/55 dark:border-slate-800/45 flex items-center justify-center">
            {generatedVideo ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <video 
                  key={generatedVideo}
                  controls 
                  autoPlay
                  muted
                  loop
                  playsInline
                  src={generatedVideo} 
                  className="max-w-full max-h-[350px] rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-800/60"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Generated video will appear here</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="audio" className="w-full">
          <div className="border rounded-xl p-6 min-h-64 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200/55 dark:border-slate-800/45 flex items-center justify-center">
            {generatedAudio ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <audio 
                  controls 
                  src={generatedAudio} 
                  className="w-full"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Generated audio will appear here</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Template Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{t.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}