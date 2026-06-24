import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    if (error || !code) {
      console.error("LinkedIn OAuth callback error:", error)
      return NextResponse.redirect(`${appUrl}/planner?error=OAuth+cancelled+or+failed`)
    }

    // Ensure user has at least one Workspace (since Integration requires workspaceId)
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: user.id }
    })
    
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "My Workspace",
          ownerId: user.id
        }
      })
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET

    let accessToken = "mock_dev_access_token"
    let personUrn = "urn:li:person:mock_dev_profile"
    let personName = user.name || "LinkedIn User"

    // If client credentials are set, do the live token exchange and profile fetch
    if (clientId && clientSecret && code !== "mock_dev_code") {
      const redirectUri = `${appUrl}/api/auth/linkedin/callback`
      
      // 1. Exchange authorization code for access token
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text()
        console.error("Failed to exchange LinkedIn code for token:", errText)
        return NextResponse.redirect(`${appUrl}/planner?error=Token+exchange+failed`)
      }

      const tokenData = await tokenResponse.json()
      accessToken = tokenData.access_token

      // 2. Fetch LinkedIn Profile information (Person URN)
      const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        personUrn = `urn:li:person:${profileData.sub}`
        personName = `${profileData.given_name || ""} ${profileData.family_name || ""}`.trim() || personName
      }
    }

    // 3. Upsert integration record
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        workspaceId: workspace.id,
        name: "linkedin"
      }
    })

    const configJson = {
      accessToken,
      personUrn,
      personName,
      isSimulated: (!clientId || !clientSecret)
    }

    if (existingIntegration) {
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          config: configJson
        }
      })
    } else {
      await prisma.integration.create({
        data: {
          name: "linkedin",
          type: "oauth",
          config: configJson,
          workspaceId: workspace.id
        }
      })
    }

    return NextResponse.redirect(`${appUrl}/planner?connected=linkedin`)

  } catch (error: any) {
    console.error("LinkedIn callback handler failed:", error)
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(`${appUrl}/planner?error=internal_callback_error`)
  }
}
