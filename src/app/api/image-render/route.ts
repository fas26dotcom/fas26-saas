import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get("prompt") || "finance"
    const seed = searchParams.get("seed") || "42"

    const externalUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=600&height=400&nologo=true&seed=${seed}`

    const response = await fetch(externalUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to load external image" }, { status: response.status })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Image proxy failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
