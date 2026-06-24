import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    // If client keys are missing, we direct to callback immediately with a mock code
    // to simulate connection flow inside the developer environment.
    if (!clientId) {
      const simulatedCallbackUrl = `${appUrl}/api/auth/linkedin/callback?code=mock_dev_code&state=mock_state`
      return NextResponse.redirect(simulatedCallbackUrl)
    }

    const redirectUri = `${appUrl}/api/auth/linkedin/callback`
    const state = Math.random().toString(36).substring(7)
    
    // Request w_member_social (for writing posts) and openid, profile (for identity/name)
    const scope = "openid profile w_member_social"
    
    const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`

    return NextResponse.redirect(authorizationUrl)

  } catch (error: any) {
    console.error("LinkedIn OAuth initiation error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
