import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get("prompt") || "finance"
    const seed = searchParams.get("seed") || "42"

    // Use Pollinations AI for high-quality, free image generation
    const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&private=true`

    const imageResponse = await fetch(pollinationsUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: `Failed to generate image from source.` }, { status: 500 })
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, must-revalidate",
      },
    })
  } catch (error: any) {
    console.error("Image proxy failed:", error)
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 })
  }
}
