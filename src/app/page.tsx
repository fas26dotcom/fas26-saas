import Link from "next/link"
import { 
  PenTool, 
  FolderKanban, 
  BarChart3, 
  CreditCard, 
  Sparkles, 
  Shield, 
  Zap, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react"

const features = [
  { 
    name: "AI Content Studio", 
    href: "/content", 
    icon: PenTool, 
    description: "Generate multi-modal content (text, image, audio, video) instantly using advanced OpenAI & Gemini templates.",
    color: "from-blue-500 to-indigo-600"
  },
  { 
    name: "Productivity Dashboard", 
    href: "/dashboard", 
    icon: FolderKanban, 
    description: "All-in-one workspace featuring task boards, automated pomodoro focus sessions, and seamless organization.",
    color: "from-purple-500 to-pink-600"
  },
  { 
    name: "Intelligent Analytics", 
    href: "/analytics", 
    icon: BarChart3, 
    description: "Track key metrics, trace token consumption, and view actionable suggestions to optimize copy and output.",
    color: "from-emerald-400 to-teal-600"
  },
  { 
    name: "Smart Pricing Tiers", 
    href: "/pricing", 
    icon: CreditCard, 
    description: "Flexible, value-oriented subscriptions for individuals and large organizations. Powered by Stripe and PayPal.",
    color: "from-amber-400 to-orange-600"
  },
]

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "10x", label: "Faster Workflows" },
  { value: "2M+", label: "Tokens Generated" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-transparent">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 pt-20 pb-16 text-center space-y-8 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-fade-in shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Introducing Next-Gen AI Workspaces
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          Supercharge Content & Work with{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Autonomous AI
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-350 max-w-2xl mx-auto font-normal leading-relaxed">
          Create premium multi-modal content, optimize SEO rankings, and manage your daily tasks with an elegant, all-in-one productivity suite built for creators.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link 
            href="/dashboard" 
            className="glow-btn bg-indigo-600 hover:bg-indigo-750 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 font-bold px-8 py-3.5 rounded-full flex items-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            Launch Console <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            href="/pricing" 
            className="glass-card hover:bg-white/20 text-slate-900 dark:text-white font-semibold px-8 py-3.5 rounded-full transition-all border border-slate-200 dark:border-slate-800"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Grid Features */}
      <section className="w-full max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="glass-card p-8 rounded-2xl flex flex-col items-start gap-4 text-left border border-slate-200/60 dark:border-slate-800/40 relative overflow-hidden group"
              >
                {/* Dynamic colored background highlights on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {feature.name}
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* AI Video Examples Showcase */}
      <section className="w-full max-w-6xl px-6 py-12 text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <Sparkles className="h-3.5 w-3.5" /> High-Fidelity Multi-Modal Outputs
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            See What Our Wan 2.1 AI Engine Generates
          </h2>
          <p className="text-sm text-slate-650 dark:text-slate-400 max-w-xl mx-auto">
            Experience photorealistic fluid dynamics, intricate details, and cinematic color grading from pure text descriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src="/littlegirlinrain.mp4"
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
            <div className="p-5 text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                Wan 2.1 Video Model
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                "A little girl enjoying in rain, parents looking at her, cinematic background rain drops"
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src="/officeparty.mp4"
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
            <div className="p-5 text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                Wan 2.1 Video Model
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                "A modern office party, colleagues cheering and laughing, high definition details"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-5xl px-6 py-16">
        <div className="grid grid-cols-3 gap-4 p-8 glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/50 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Reliability */}
      <section className="w-full max-w-6xl px-6 py-12 text-center space-y-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          <Shield className="h-10 w-10 text-emerald-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enterprise-Grade Architecture</h2>
          <p className="text-sm text-slate-600 dark:text-slate-450">
            FAS26 SaaS operates on secured cloud layers. Real-time payments are encrypted end-to-end via Stripe PCI-DSS Level 1 compliance and official PayPal gateway layers.
          </p>
        </div>
      </section>
    </div>
  )
}