import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = (searchParams.get("prompt") || "").toLowerCase()

    // 1. Curate open, high-speed Google Cloud CC0 video loops (100% immune to Cloudflare 403 blocks)
    const videoUrls = {
      industrial: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      finance: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      office: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      abstract: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    }

    // 2. Select the loop dynamically matching user intent
    let selectedVideo = videoUrls.abstract
    if (prompt.includes("scrap") || prompt.includes("metal") || prompt.includes("plastic") || prompt.includes("factory") || prompt.includes("worker") || prompt.includes("mountain") || prompt.includes("snow")) {
      selectedVideo = videoUrls.industrial
    } else if (prompt.includes("tax") || prompt.includes("finance") || prompt.includes("income") || prompt.includes("money") || prompt.includes("tds")) {
      selectedVideo = videoUrls.finance
    } else if (prompt.includes("office") || prompt.includes("meeting") || prompt.includes("laptop") || prompt.includes("work")) {
      selectedVideo = videoUrls.office
    }

    // 3. Redirect to the direct media file so Chrome/Safari can stream it perfectly with HTTP Range headers
    return NextResponse.redirect(selectedVideo)
  } catch (error) {
    console.error("Video redirect failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
