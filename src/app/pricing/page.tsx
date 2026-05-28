"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, CreditCard, Wallet, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react"

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "7 days",
    description: "Start exploring our premium tools.",
    features: [
      "5,000 tokens limit", 
      "Basic templates", 
      "5 AI Images / day", 
      "🎥 1 Video generation included",
      "🎵 1 Audio generation included",
      "Community support"
    ],
    featured: false,
    buttonText: "Sign Up Free",
    color: "border-slate-200 dark:border-slate-800"
  },
  {
    name: "Starter",
    price: "$29",
    period: "month",
    description: "Perfect for content creators starting out.",
    features: [
      "50,000 tokens / month", 
      "All templates included", 
      "100 AI Images / month", 
      "🎥 10 Premium AI Videos / month", 
      "🎵 15 AI Audio tracks / month",
      "Email support"
    ],
    featured: false,
    buttonText: "Upgrade to Starter",
    color: "border-slate-200 dark:border-slate-800"
  },
  {
    name: "Pro",
    price: "$99",
    period: "month",
    description: "Ultimate toolkit for professional developers.",
    features: [
      "250,000 tokens / month", 
      "Brand voice & SEO tools", 
      "🖼️ 250 AI Images / month", 
      "🎥 30 Premium AI Videos / month", 
      "🎵 50 AI Audio tracks / month",
      "24/7 Priority support"
    ],
    featured: true,
    buttonText: "Upgrade to Pro",
    color: "border-indigo-500 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/5 relative"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Customized solutions for massive operations.",
    features: [
      "Unlimited tokens / credits", 
      "Dedicated custom video models", 
      "Unlimited Images & Audio", 
      "Dedicated Account Manager",
      "Custom fine-tuning & SLAs"
    ],
    featured: false,
    buttonText: "Contact Sales",
    color: "border-slate-200 dark:border-slate-800"
  },
]

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [checkoutModal, setCheckoutModal] = useState<{ active: boolean; plan: string; price: string } | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [checkoutStep, setCheckoutStep] = useState<"gateway" | "details" | "success">("gateway")
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | null>(null)
  const [isSimulatedMode, setIsSimulatedMode] = useState(false)

  useEffect(() => {
    const checkoutParam = searchParams.get("checkout")
    const planParam = searchParams.get("plan")
    const priceParam = searchParams.get("price")
    const paymentSuccessParam = searchParams.get("payment")

    if (checkoutParam === "simulated" && planParam && priceParam) {
      setCheckoutModal({ active: true, plan: planParam, price: priceParam })
      setCheckoutStep("gateway")
      setIsSimulatedMode(true)
    }

    if (paymentSuccessParam === "success" && planParam) {
      setPaymentSuccess(planParam)
    }
  }, [searchParams])

  const handleCheckout = (plan: typeof plans[0]) => {
    if (plan.price === "$0" || plan.price === "Custom") {
      router.push("/dashboard")
      return
    }
    setIsSimulatedMode(false)
    setCheckoutModal({ active: true, plan: plan.name, price: plan.price })
    setCheckoutStep("gateway")
  }

  const handleProceedToPayment = async (gateway: "stripe" | "paypal") => {
    setLoadingPlan(checkoutModal?.plan || null)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planName: checkoutModal?.plan, 
          price: checkoutModal?.price,
          gateway 
        }),
      })
      const data = await response.json()
      if (data.success && data.url) {
        if (data.url.startsWith("http://") || data.url.startsWith("https://")) {
          window.location.href = data.url
        } else {
          setPaymentMethod(gateway)
          setCheckoutStep("details")
        }
      } else {
        alert("Failed to initiate payment gateway")
      }
    } catch {
      alert("Error reaching checkout server")
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleSimulatedPayment = () => {
    setCheckoutStep("success")
    setTimeout(() => {
      setCheckoutModal(null)
      // Call update plan endpoint on success (simulated API update could go here)
      router.push(`/dashboard?payment=success&plan=${encodeURIComponent(checkoutModal?.plan || "")}`)
    }, 2000)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Flexible Plans for Every{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Growth Stage
          </span>
        </h1>
        <p className="text-slate-650 dark:text-slate-400">
          Supercharge your workspace with elite credits, templates, and priority processing. Cancel or change tier settings at any time.
        </p>
      </div>

      {/* Success Notification */}
      {paymentSuccess && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-md animate-in fade-in duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Payment Successful!</p>
            <p className="text-xs mt-0.5">Your account has been upgraded to the <strong>{paymentSuccess} Plan</strong>. Access your new capabilities inside the dashboard.</p>
          </div>
        </div>
      )}

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`glass-card flex flex-col justify-between p-2 rounded-2xl border transition-all duration-300 ${plan.color} ${
              plan.featured ? "scale-100 lg:scale-[1.03] ring-1 ring-indigo-500/20" : ""
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Popular
              </span>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">{plan.name}</CardTitle>
              <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-slate-500 text-xs font-semibold">/{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-2">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-650 dark:text-slate-350">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleCheckout(plan)} 
                disabled={loadingPlan !== null}
                className={`w-full font-bold text-xs py-2.5 rounded-xl transition-all ${
                  plan.featured 
                    ? "bg-indigo-600 hover:bg-indigo-750 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-500/20" 
                    : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 bg-transparent"
                }`}
              >
                {loadingPlan === plan.name ? "Connecting..." : plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checkout Simulator Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setCheckoutModal(null)} />
          
          <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {checkoutStep === "gateway" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mb-2">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isSimulatedMode ? "Secure Checkout Simulator" : "Secure Checkout"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isSimulatedMode 
                      ? "Choose a testing gateway to proceed with sandbox payment." 
                      : "Choose your preferred payment method to upgrade your workspace."}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-center">
                  <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Plan Selected</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">{checkoutModal.plan} Plan</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{checkoutModal.price}/month</p>
                  
                  <div className="space-y-3 mt-4">
                    <button 
                      onClick={() => handleProceedToPayment("stripe")}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all font-semibold text-xs text-slate-800 dark:text-slate-200 text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
                        {isSimulatedMode ? "Pay with Stripe Sandbox" : "Pay with Credit / Debit Card"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {isSimulatedMode ? "Simulate Card" : "Visa, Mastercard, Amex"}
                      </span>
                    </button>

                    <button 
                      onClick={() => handleProceedToPayment("paypal")}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all font-semibold text-xs text-slate-800 dark:text-slate-200 text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <Wallet className="h-4.5 w-4.5 text-amber-500" />
                        {isSimulatedMode ? "Pay with PayPal Sandbox" : "Pay with PayPal Checkout"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {isSimulatedMode ? "Simulate Wallet" : "Instant & Secure"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                  {isSimulatedMode ? "End-to-end sandbox connection" : "End-to-end SSL encryption active"}
                </div>
              </div>
            )}

            {checkoutStep === "details" && (
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {paymentMethod === "stripe" ? "Stripe Sandbox Credentials" : "PayPal Sandbox Login"}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Use simulated values to complete payment authentication.</p>
                </div>

                {paymentMethod === "stripe" ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-400 mb-1.5">Card Number</label>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242 (Stripe Demo)"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-250 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-400 mb-1.5">Expiry Date</label>
                        <input type="text" placeholder="12/28" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-250 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-400 mb-1.5">CVC</label>
                        <input type="text" placeholder="424" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-250 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-400 mb-1.5">PayPal Account Email</label>
                      <input 
                        type="email" 
                        value={paypalEmail} 
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="sandbox-buyer@paypal.com"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-250 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCheckoutStep("gateway")}
                    className="flex-1 text-xs py-2 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSimulatedPayment}
                    className="flex-1 text-xs py-2 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Confirm Sandbox Payment
                  </Button>
                </div>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 animate-bounce">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Verifying Transaction...</h3>
                <p className="text-xs text-slate-500">Upgrade complete! Redirecting you back to your workspace console.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Pricing...</div>}>
      <PricingContent />
    </Suspense>
  )
}