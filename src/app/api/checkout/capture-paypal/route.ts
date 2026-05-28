import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

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
      console.error("PayPal OAuth failed in capture, status:", response.status, await response.text())
      return null
    }
    const data = await response.json()
    return data.access_token
  } catch (err) {
    console.error("PayPal OAuth exception in capture:", err)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userSession = getUserFromRequest(request)
    if (!userSession) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, planName } = await request.json()
    if (!orderId || !planName) {
      return NextResponse.json({ success: false, error: "Missing orderId or planName" }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Failed to authenticate with PayPal" }, { status: 500 })
    }

    // Capture the PayPal Order
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`PayPal Order Capture failed for ${orderId}:`, response.status, errorText)
      return NextResponse.json({ success: false, error: "PayPal capture rejected", details: errorText }, { status: 400 })
    }

    const orderData = await response.json()
    const isCompleted = orderData.status === "COMPLETED"

    if (!isCompleted) {
      return NextResponse.json({ success: false, error: `PayPal order status is ${orderData.status}` }, { status: 400 })
    }

    // Upgrade the user plan in the database
    const updatedUser = await prisma.user.update({
      where: { id: userSession.id },
      data: {
        plan: planName.toUpperCase()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully captured order. Upgraded to ${planName} plan!`,
      plan: updatedUser.plan
    })

  } catch (error: any) {
    console.error("Capture PayPal endpoint error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
