"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  PenTool, 
  BarChart3, 
  Settings,
  CreditCard,
  FolderKanban,
  Palette,
  Search,
  FileText,
  Calendar,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ArrowRight,
  LogOut
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "AI Content", icon: PenTool },
  { href: "/brand-voice", label: "Brand Voice", icon: Palette },
  { href: "/seo", label: "SEO Tools", icon: Search },
  { href: "/workspace", label: "Workspace", icon: FolderKanban },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user)
        } else {
          // If not authenticated and not on a public page, redirect
          const isPublicPage = pathname === "/" || pathname === "/auth" || pathname === "/auth/signup" || pathname === "/pricing"
          if (!isPublicPage) {
            window.location.href = "/auth"
          }
        }
      })
      .catch(() => {})
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/auth"
    } catch {
      window.location.href = "/auth"
    }
  }

  // Identify public landing pages that don't need the dashboard sidebar layout
  const isPublicPage = pathname === "/" || pathname === "/auth" || pathname === "/auth/signup" || pathname === "/pricing"

  if (isPublicPage) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Beautiful Glassmorphic Public Header */}
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">FAS26 SaaS</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="/" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Home</Link>
              <Link href="/pricing" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Pricing</Link>
              <Link href="/dashboard" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Dashboard</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors">
                Sign In
              </Link>
              <Link 
                href="/dashboard" 
                className="glow-btn bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="w-full py-6 text-center text-xs text-gray-500 border-t border-gray-200/50 dark:border-gray-800/50 glass-panel">
          <p className="font-semibold text-gray-600 dark:text-gray-400">
            app.fas26.com BY FAS26 - email: <a href="mailto:info@fas26.com" className="hover:text-indigo-500 transition-colors">info@fas26.com</a>
          </p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50 dark:bg-slate-950/50">
      
      {/* Mobile Top Bar */}
      <header className="md:hidden w-full h-16 flex items-center justify-between px-6 glass-panel border-b border-gray-200/50 dark:border-gray-800/50 z-40">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">FAS26</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Persistent Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-gray-200/50 dark:border-gray-800/50 flex-col sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
            <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">FAS26 SaaS</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-l-2 border-indigo-500 shadow-sm"
                    : "text-gray-600 hover:bg-slate-100 dark:text-gray-350 dark:hover:bg-slate-900/50 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4.5 w-4.5", isActive ? "text-indigo-500" : "text-gray-400")} />
                  {item.label}
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-150/40 dark:bg-slate-900/40">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-150 truncate">{user ? user.name : "Loading User..."}</p>
              <p className="text-[10px] text-gray-500 truncate">{user ? user.email : ""}</p>
            </div>
            {user && (
              <button 
                onClick={handleLogout} 
                className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <nav className="relative flex flex-col w-4/5 max-w-sm h-full bg-white dark:bg-slate-950 p-6 shadow-2xl animate-in slide-in-from-left duration-250 border-r border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">FAS26 SaaS</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-650 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-l-2 border-indigo-500"
                        : "text-gray-600 hover:bg-slate-100 dark:text-gray-350 dark:hover:bg-slate-900/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4.5 w-4.5", isActive ? "text-indigo-500" : "text-gray-400")} />
                      {item.label}
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                  </Link>
                )
              })}
            </div>
            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-150 truncate">{user ? user.name : "Loading User..."}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user ? user.email : ""}</p>
                  </div>
                </div>
                {user && (
                  <button 
                    onClick={handleLogout} 
                    className="p-2 text-gray-500 hover:text-rose-500 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full overflow-hidden transition-all duration-300">
        <div className="flex-1">
          {children}
        </div>
        <footer className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/50 text-center text-xs text-gray-500">
          <p className="font-semibold text-gray-600 dark:text-gray-400">
            app.fas26.com BY FAS26 - email: <a href="mailto:info@fas26.com" className="hover:text-indigo-500 transition-colors">info@fas26.com</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
