import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postContent, imageUrl } = await request.json()

    if (!postContent?.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 })
    }

    // Fetch full user record to verify plan and registration date
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    // Enforce 7-day LinkedIn integration limit for Free Trial users
    if (dbUser.plan === "TRIAL" || !dbUser.plan) {
      const signupDate = new Date(dbUser.createdAt)
      const diffTime = Date.now() - signupDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      if (diffDays > 7) {
        return NextResponse.json({ 
          error: "Your 7-day Free Trial of LinkedIn publishing has expired. Please upgrade your plan to unlock unlimited auto-publishing." 
        }, { status: 403 })
      }
    }

    // Find user workspace and integration
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: user.id }
    })

    if (!workspace) {
      return NextResponse.json({ error: "No active workspace found." }, { status: 400 })
    }

    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: workspace.id,
        name: "linkedin"
      }
    })

    if (!integration || !integration.config) {
      return NextResponse.json({ error: "LinkedIn account not connected. Please connect LinkedIn first." }, { status: 400 })
    }

    const config: any = integration.config

    // Case 1: Simulated Developer Mode
    if (config.isSimulated) {
      // Simulate network request delay (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      const mockPostUrn = `urn:li:share:mock_${Math.floor(Math.random() * 10000000)}`
      return NextResponse.json({
        success: true,
        message: "Post successfully published to LinkedIn (Simulated Dev Mode)!",
        postUrn: mockPostUrn,
        link: "https://www.linkedin.com/feed/"
      })
    }

    // Case 2: Live LinkedIn API Call
    const accessToken = config.accessToken
    const personUrn = config.personUrn

    // Construct the payload for the standard LinkedIn POSTS API (v2)
    const payload: any = {
      author: personUrn,
      commentary: postContent,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED"
    }

    // If an image URL is supplied, we can optionally attach it as content media
    // Note: For live image uploads, LinkedIn requires asset registration, but they also
    // allow attaching external article/media links. We attach the image as an external article link.
    if (imageUrl) {
      payload.content = {
        media: {
          title: "Generated Graphic via FAS26 SaaS",
          id: personUrn
        },
        article: {
          source: imageUrl,
          title: "Shared Campaign Image",
          description: "Created using FAS26 Social Media Planner"
        }
      }
    }

    const response = await fetch("https://api.linkedin.com/v2/posts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("LinkedIn API publish failed:", errText)
      return NextResponse.json({ 
        error: "Failed to publish to LinkedIn API. Your token may have expired. Please disconnect and reconnect your account." 
      }, { status: response.status })
    }

    // LinkedIn returns the post URN in the "x-restli-id" response header
    const postUrn = response.headers.get("x-restli-id") || `urn:li:share:live_post`

    return NextResponse.json({
      success: true,
      message: "Successfully published to your live LinkedIn feed!",
      postUrn,
      link: `https://www.linkedin.com/feed/update/${postUrn}`
    })

  } catch (error: any) {
    console.error("LinkedIn publishing handler error:", error)
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 })
  }
}
