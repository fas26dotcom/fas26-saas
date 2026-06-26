import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

function parseDateTime(dateStr: string, timeStr: string): Date {
  const cleanTime = timeStr.trim().toUpperCase()
  
  let hours = 10
  let minutes = 0
  
  const ampmMatch = cleanTime.match(/^(\d+):(\d+)\s*(AM|PM)$/)
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1])
    minutes = parseInt(ampmMatch[2])
    const modifier = ampmMatch[3]
    
    if (modifier === "PM" && hours < 12) {
      hours += 12
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0
    }
  } else {
    const timeMatch = cleanTime.match(/^(\d+):(\d+)$/)
    if (timeMatch) {
      hours = parseInt(timeMatch[1])
      minutes = parseInt(timeMatch[2])
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

    const { postContent, imageUrl, date, time, scheduledAt, platform } = await request.json()

    if (!postContent?.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 })
    }
    if (!scheduledAt && (!date || !time)) {
      return NextResponse.json({ error: "Date and time (or scheduledAt) are required for scheduling" }, { status: 400 })
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

    const scheduledAtDate = scheduledAt ? new Date(scheduledAt) : parseDateTime(date, time)

    const newScheduledPost = await prisma.scheduledPost.create({
      data: {
        platform: targetPlatform.toLowerCase(),
        postContent,
        imageUrl,
        scheduledAt: scheduledAtDate,
        status: "SCHEDULED",
        workspaceId: workspace.id,
        userId: user.id
      }
    })

    // Look for matching CalendarEvent to keep in sync
    try {
      const calendarEvent = await prisma.calendarEvent.findFirst({
        where: {
          userId: user.id,
          title: {
            contains: postContent
          }
        }
      })
      if (calendarEvent) {
        await prisma.calendarEvent.update({
          where: { id: calendarEvent.id },
          data: {
            date: date || scheduledAtDate.toISOString().split("T")[0],
            time: time || "10:00 AM"
          }
        })
      }
    } catch (syncErr: any) {
      console.error("Failed to sync calendar event on schedule:", syncErr.message)
    }

    return NextResponse.json({
      success: true,
      message: "Post successfully scheduled!",
      scheduledPostId: newScheduledPost.id,
      scheduledAt: scheduledAtDate.toISOString()
    })

  } catch (error: any) {
    console.error("LinkedIn post scheduling error:", error)
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 })
  }
}
