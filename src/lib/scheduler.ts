import { prisma } from "@/lib/prisma"

// Helper function to publish a post natively to LinkedIn
export async function publishToLinkedIn(
  postContent: string,
  imageUrl: string | null,
  accessToken: string,
  personUrn: string
): Promise<{ success: boolean; postUrn?: string; link?: string; error?: string }> {
  try {
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

    let absoluteImageUrl = imageUrl
    if (imageUrl && imageUrl.startsWith("/")) {
      const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      absoluteImageUrl = `${appUrl}${imageUrl}`
      
      // Fallback for localhost testing
      if (appUrl.includes("localhost")) {
        try {
          const parsed = new URL(absoluteImageUrl)
          const prompt = parsed.searchParams.get("prompt") || "business"
          const seed = parsed.searchParams.get("seed") || "42"
          absoluteImageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`
        } catch (e) {
          console.error("Failed to parse relative image URL in cron:", e)
        }
      }
    }

    let assetUrn = ""
    if (absoluteImageUrl) {
      // 1. Download image binary
      const imgDownloadRes = await fetch(absoluteImageUrl)
      if (!imgDownloadRes.ok) {
        throw new Error("Failed to download image from source: " + absoluteImageUrl)
      }
      const arrayBuffer = await imgDownloadRes.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // 2. Register upload request
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

      // 3. Upload binary to LinkedIn
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

    // 4. Create the post
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
      throw new Error(`LinkedIn API publish failed (${response.status}): ${errText}`)
    }

    const postUrn = response.headers.get("x-restli-id") || `urn:li:share:live_post`
    return {
      success: true,
      postUrn,
      link: `https://www.linkedin.com/feed/update/${postUrn}`
    }

  } catch (err: any) {
    console.error("LinkedIn publish operation error:", err)
    return {
      success: false,
      error: err.message || "Unknown error occurred"
    }
  }
}

export async function checkAndPublishDuePosts(workspaceId?: string) {
  const now = new Date()
  
  // Build query filter
  const whereFilter: any = {
    status: "SCHEDULED",
    scheduledAt: {
      lte: now
    }
  }
  
  if (workspaceId) {
    whereFilter.workspaceId = workspaceId
  }

  const postsToPublish = await prisma.scheduledPost.findMany({
    where: whereFilter
  })

  console.log(`Cron/Background Publisher: Found ${postsToPublish.length} posts due for publishing${workspaceId ? ` in workspace ${workspaceId}` : ''}.`)

  const results = []

  for (const post of postsToPublish) {
    try {
      // Fetch target integration details
      const integration = await prisma.integration.findFirst({
        where: {
          workspaceId: post.workspaceId,
          name: post.platform
        }
      })

      if (!integration || !integration.config) {
        throw new Error(`${post.platform.toUpperCase()} integration not found or disconnected.`)
      }

      const config = integration.config as any
      
      let publishResult
      if (config.isSimulated) {
        // Simulated publish in mock/developer mode
        console.log(`[SIMULATED] Publishing post ID ${post.id} to ${post.platform}`)
        publishResult = {
          success: true,
          postUrn: `urn:li:share:mock_${Math.floor(Math.random() * 10000000)}`,
          link: "https://www.linkedin.com/feed/"
        }
      } else {
        // Live publish
        console.log(`[LIVE] Publishing post ID ${post.id} to ${post.platform}`)
        publishResult = await publishToLinkedIn(
          post.postContent,
          post.imageUrl,
          config.accessToken,
          config.personUrn
        )
      }

      if (publishResult.success) {
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: "PUBLISHED",
            publishedLink: publishResult.link,
            error: null
          }
        })
        results.push({ id: post.id, status: "PUBLISHED" })
      } else {
        throw new Error(publishResult.error || "Failed to publish")
      }

    } catch (err: any) {
      console.error(`Failed to publish scheduled post ${post.id}:`, err.message)
      
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: {
          status: "FAILED",
          error: err.message
        }
      })
      results.push({ id: post.id, status: "FAILED", error: err.message })
    }
  }

  return results
}
