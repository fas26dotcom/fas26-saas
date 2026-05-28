import { NextRequest, NextResponse } from "next/server"

// Dynamic hosts based on mode
const PAYPAL_API = process.env.PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com"

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    })

    if (!response.ok) {
      console.error("PayPal OAuth failed, status:", response.status, await response.text())
      return null
    }
    const data = await response.json()
    return data.access_token
  } catch (err) {
    console.error("PayPal OAuth exception:", err)
    return null
  }
}

async function createPayPalOrder(accessToken: string, planName: string, price: string, successUrl: string, cancelUrl: string) {
  try {
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""))
    
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: numericPrice.toFixed(2)
          },
          description: `FAS26 SaaS - ${planName} Plan`
        }],
        application_context: {
          return_url: successUrl,
          cancel_url: cancelUrl,
          user_action: "PAY_NOW"
        }
      })
    })

    if (!response.ok) {
      console.error("PayPal order creation failed, status:", response.status, await response.text())
      return null
    }
    const data = await response.json()
    return data.links?.find((l: any) => l.rel === "approve")?.href
  } catch (err) {
    console.error("PayPal order exception:", err)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { planName, price, currency = "USD", gateway = "stripe" } = await request.json()

    if (!planName || !price) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const successUrl = `${request.nextUrl.origin}/dashboard?payment=success&plan=${encodeURIComponent(planName)}`
    const cancelUrl = `${request.nextUrl.origin}/pricing?payment=cancelled`

    // 1. PayPal Integration
    if (gateway === "paypal") {
      const paypalToken = await getPayPalAccessToken()
      if (paypalToken) {
        const approvalUrl = await createPayPalOrder(paypalToken, planName, price, successUrl, cancelUrl)
        if (approvalUrl) {
          return NextResponse.json({
            success: true,
            url: approvalUrl,
            provider: "PayPal",
          })
        }
      }
    }

    // 2. Stripe Checkout integration
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (stripeSecretKey && gateway === "stripe") {
      try {
        const Stripe = require("stripe")
        const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" })
        const unitAmount = Math.round(parseFloat(price.replace(/[^0-9.]/g, "")) * 100)

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name: `FAS26 SaaS - ${planName} Plan`,
                  description: `Access to premium AI capabilities and tools.`,
                },
                unit_amount: unitAmount,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
        })

        return NextResponse.json({
          success: true,
          url: session.url,
          provider: "Stripe",
        })
      } catch (stripeError: any) {
        console.error("Stripe Checkout creation error:", stripeError)
      }
    }

    // 3. Fallback Mock Sandbox Checkout Simulator (if live keys are absent or failed)
    const simulatedCheckoutUrl = `/pricing?checkout=simulated&plan=${encodeURIComponent(planName)}&price=${encodeURIComponent(price)}`
    
    return NextResponse.json({
      success: true,
      url: simulatedCheckoutUrl,
      provider: "Mock Sandbox Gateway",
      isMock: true
    })

  } catch (error) {
    console.error("Checkout endpoint error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
