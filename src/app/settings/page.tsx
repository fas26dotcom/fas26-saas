"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Shield, CreditCard, Sparkles, CheckCircle2, AlertCircle, KeyRound, Lock, Crown } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string; plan: string; role: string; createdAt: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"profile" | "subscription" | "security">("profile")
  
  // Profile Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [userRole, setUserRole] = useState("USER")
  const [userPlan, setUserPlan] = useState("TRIAL")
  
  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Loading & Msg States
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const fetchSession = () => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user)
          setName(data.user.name || "")
          setEmail(data.user.email || "")
          setUserRole(data.user.role || "USER")
          setUserPlan(data.user.plan || "TRIAL")
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchSession()
  }, [])

  // Calculate remaining trial days
  const getTrialDaysLeft = () => {
    if (!user || user.plan !== "TRIAL") return 0
    const createdDate = new Date(user.createdAt || Date.now())
    const expiryDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    const difference = expiryDate.getTime() - Date.now()
    const daysLeft = Math.ceil(difference / (24 * 60 * 60 * 1000))
    return daysLeft > 0 ? daysLeft : 0
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMsg("")
    setErrorMsg("")

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role: userRole,
          plan: userPlan
        })
      })

      const data = await res.json()
      if (data.success) {
        setSuccessMsg("Profile settings updated successfully!")
        fetchSession()
      } else {
        setErrorMsg(data.error || "Failed to update profile settings.")
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMsg("")
    setErrorMsg("")

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()
      if (data.success) {
        setSuccessMsg("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setErrorMsg(data.error || "Failed to change password.")
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const daysLeft = getTrialDaysLeft()
  const isAdmin = userRole === "ADMIN"

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account settings, profile information, and subscription plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar inside Settings */}
        <div className="space-y-2 col-span-1">
          <Button 
            variant="ghost" 
            onClick={() => { setActiveTab("profile"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full justify-start gap-2.5 font-medium transition-all ${
              activeTab === "profile" 
                ? "bg-indigo-55/20 text-indigo-500 dark:bg-indigo-950/40" 
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"
            }`}
          >
            <User className="h-4 w-4" /> Profile Info
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => { setActiveTab("subscription"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full justify-start gap-2.5 font-medium transition-all ${
              activeTab === "subscription" 
                ? "bg-indigo-55/20 text-indigo-500 dark:bg-indigo-950/40" 
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Subscription & Plan
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => { setActiveTab("security"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full justify-start gap-2.5 font-medium transition-all ${
              activeTab === "security" 
                ? "bg-indigo-55/20 text-indigo-500 dark:bg-indigo-950/40" 
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-500"
            }`}
          >
            <Shield className="h-4 w-4" /> Security
          </Button>
        </div>

        {/* Content Area */}
        <div className="col-span-2 space-y-6">
          {successMsg && (
            <div className="p-3 text-sm text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 text-sm text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-250/50 dark:border-rose-900/30 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 text-rose-500" /> {errorMsg}
            </div>
          )}

          {activeTab === "profile" && (
            <Card className="glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Profile Details</CardTitle>
                <CardDescription>Update your personal details and system privileges</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} readOnly className="bg-slate-50 dark:bg-slate-900 text-slate-500 cursor-not-allowed border-slate-200/50" />
                  </div>

                  {/* ADMIN TOGGLE SECTION FOR UNLIMITED ACCESS */}
                  <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="admin-role" className="font-bold flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400">
                          <Crown className="h-4 w-4 text-indigo-500 animate-pulse" /> Developer Admin Access
                        </Label>
                        <p className="text-xs text-slate-500 dark:text-slate-450">
                          Activate Admin Mode to get unlimited video, audio, text, and image generations.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="admin-role"
                        className="w-10 h-5 accent-indigo-600 rounded-full cursor-pointer"
                        checked={userRole === "ADMIN"}
                        onChange={(e) => {
                          const newRole = e.target.checked ? "ADMIN" : "USER"
                          setUserRole(newRole)
                          // Auto set plan to UNLIMITED if admin is turned on
                          if (newRole === "ADMIN") {
                            setUserPlan("UNLIMITED")
                          } else {
                            setUserPlan("TRIAL")
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-indigo-100/30 dark:border-indigo-900/30">
                      <Label htmlFor="plan-select" className="text-xs font-semibold text-slate-700 dark:text-slate-350">Simulated Plan Level</Label>
                      <select 
                        id="plan-select" 
                        value={userPlan} 
                        onChange={(e) => setUserPlan(e.target.value)}
                        className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="TRIAL">7-Day Free Trial</option>
                        <option value="STARTER">Starter Plan ($19/mo)</option>
                        <option value="PRO">Pro Plan ($49/mo)</option>
                        <option value="UNLIMITED">Admin / Unlimited Plan (Developer Preset)</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="glow-btn bg-indigo-600 hover:bg-indigo-750 text-white w-full md:w-auto">
                    {isLoading ? "Saving changes..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "subscription" && (
            <Card className="glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" /> Subscription Plan
                </CardTitle>
                <CardDescription>Your current subscription tier and access limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {isAdmin ? "Admin / Developer Unlimited" : user?.plan === "TRIAL" ? "7-Day Free Trial" : `${user?.plan || "Starter"} Plan`}
                      {isAdmin && <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/30">Unlimited Active</span>}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isAdmin 
                        ? "Bypassing all quota restrictions. Generation limits inactive." 
                        : user?.plan === "TRIAL" 
                        ? `${daysLeft} days remaining in trial period`
                        : "Access to all premium features active"}
                    </p>
                  </div>
                  {!isAdmin && (
                    <Button 
                      onClick={() => window.location.href = "/pricing"} 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 shadow-md"
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>

                {/* Free Trial Limits explanation */}
                {!isAdmin && userPlan === "TRIAL" ? (
                  <div className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-xl space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-350">💡 Free Trial Limits:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>5,000 tokens generation limit.</li>
                      <li>Basic content generation templates.</li>
                      <li>5 AI Images per day.</li>
                      <li className="text-rose-500 font-medium">❌ Video & Audio Generation is restricted to 1 test generation.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-xl space-y-2">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-450">✓ Premium features unlocked:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Unlimited text & content generation.</li>
                      <li>Priority high-fidelity image generations.</li>
                      <li>Full HD video generation via Replicate (Wan Video).</li>
                      <li>High quality audio and voice synthesis synthesis.</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-500" /> Password & Security
                </CardTitle>
                <CardDescription>Update your login credentials and secure your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateSecurity} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        className="pl-9" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="pl-9" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="pl-9" 
                        required 
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="glow-btn bg-indigo-600 hover:bg-indigo-750 text-white w-full md:w-auto">
                    {isLoading ? "Updating password..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
