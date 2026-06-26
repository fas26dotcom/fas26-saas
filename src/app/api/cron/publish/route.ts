import { NextRequest, NextResponse } from "next/server"
import { checkAndPublishDuePosts } from "@/lib/scheduler"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // 1. Cron Security check
    const authHeader = request.headers.get("Authorization")
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Process publishing for all workspaces
    const results = await checkAndPublishDuePosts()

    return NextResponse.json({
      success: true,
      message: `Completed processing ${results.length} scheduled post(s).`,
      results
    })

  } catch (error: any) {
    console.error("Cron Publisher fatal error:", error)
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 })
  }
}
