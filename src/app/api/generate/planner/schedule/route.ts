import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

function parseDateTime(dateStr: string, timeStr: string): Date {
  const cleanTime = timeStr.trim().toUpperCase()
  const match = cleanTime.match(/^(\d+):(\d+)\s*(AM|PM)$/)
  
  let hours = 10
  let minutes = 0
  
  if (match) {
    hours = parseInt(match[1])
    minutes = parseInt(match[2])
    const modifier = match[3]
    
    if (modifier === "PM" && hours < 12) {
      hours += 12
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0
    }
  }
  
  const [year, month, day] = dateStr.split("-").map(Number)
  // Create date in local timezone
  return new Date(year, month - 1, day, hours, minutes, 0)
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postContent, imageUrl, date, time, platform } = await request.json()

    if (!postContent?.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 })
    }
    if (!date || !time) {
      return NextResponse.json({ error: "Date and time are required for scheduling" }, { status: 400 })
    }

    // Find user workspace and integration
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: user.id }
    })

    if (!workspace) {
      return NextResponse.json({ error: "No active workspace found." }, { status: 400 })
    }

    // Verify integration connection
    const targetPlatform = platform || "linkedin"
    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: workspace.id,
        name: targetPlatform.toLowerCase()
      }
    })

    if (!integration || !integration.config) {
      return NextResponse.json({ 
        error: `${targetPlatform.toUpperCase()} account not connected. Please connect your profile first.` 
      }, { status: 400 })
    }

    const scheduledAt = parseDateTime(date, time)

    const newScheduledPost = await prisma.scheduledPost.create({
      data: {
        platform: targetPlatform.toLowerCase(),
        postContent,
        imageUrl,
        scheduledAt,
        status: "SCHEDULED",
        workspaceId: workspace.id,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "Post successfully scheduled!",
      scheduledPostId: newScheduledPost.id,
      scheduledAt: scheduledAt.toISOString()
    })

  } catch (error: any) {
    console.error("LinkedIn post scheduling error:", error)
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 })
  }
}
