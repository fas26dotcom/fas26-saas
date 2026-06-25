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
    let absoluteImageUrl = imageUrl
    if (imageUrl && imageUrl.startsWith("/")) {
      const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      absoluteImageUrl = `${appUrl}${imageUrl}`
      
      // During local development, LinkedIn cannot crawl localhost.
      // We automatically map local image-render proxies directly to the public Pollinations URL
      // so LinkedIn's crawlers can fetch the image preview successfully.
      if (appUrl.includes("localhost")) {
        try {
          const parsed = new URL(absoluteImageUrl)
          const prompt = parsed.searchParams.get("prompt") || "business"
          const seed = parsed.searchParams.get("seed") || "42"
          absoluteImageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`
        } catch (e) {
          console.error("Failed to parse relative image URL for local fallback:", e)
        }
      }
    }

    let assetUrn = ""
    if (absoluteImageUrl) {
      try {
        // 1. Download image binary from the source
        const imgDownloadRes = await fetch(absoluteImageUrl)
        if (!imgDownloadRes.ok) {
          throw new Error("Failed to download generated image from source: " + absoluteImageUrl)
        }
        const arrayBuffer = await imgDownloadRes.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 2. Register upload request with LinkedIn Assets API
        const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: personUrn,
              supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"],
              serviceRelationships: [
                {
                  identifier: "urn:li:userGeneratedContent",
                  relationshipType: "OWNER"
                }
              ]
            }
          })
        })

        if (!registerRes.ok) {
          throw new Error(`Register upload failed (${registerRes.status}): ${await registerRes.text()}`)
        }

        const registerData = await registerRes.json()
        const uploadMechanism = registerData.value.uploadMechanism
        const firstMechanism = Object.values(uploadMechanism)[0] as any
        const uploadUrl = firstMechanism.uploadUrl
        assetUrn = registerData.value.asset

        // 3. Upload the image binary directly to the provided uploadUrl
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "image/jpeg"
          },
          body: buffer
        })

        if (!uploadRes.ok) {
          throw new Error(`Upload binary failed (${uploadRes.status}): ${await uploadRes.text()}`)
        }
      } catch (uploadError: any) {
        console.error("LinkedIn image upload failed:", uploadError)
        return NextResponse.json({
          error: "Failed to upload image to LinkedIn. Details: " + uploadError.message
        }, { status: 400 })
      }
    }

    if (assetUrn) {
      const imageUrn = assetUrn.replace("urn:li:digitalmediaAsset:", "urn:li:image:")
      payload.content = {
        media: {
          id: imageUrn,
          title: "FAS26 Campaign Image"
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
        error: "Failed to publish to LinkedIn API. Please disconnect and reconnect your account. Details: " + errText
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
