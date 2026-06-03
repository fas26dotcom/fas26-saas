import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get("prompt") || "finance"
    const seed = searchParams.get("seed") || "42"

    const replicateToken = process.env.REPLICATE_API_TOKEN
    const externalUrl = "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions"

    const response = await fetch(externalUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({ input: { prompt: prompt, aspect_ratio: "3:2" } }),
    })
    
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to generate image: ${response.status} ${response.statusText}` }, { status: response.status })
    }

    const data = await response.json()
    const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output

    if (!imageUrl) {
      return NextResponse.json({ error: `Image generation failed or returned no output.` }, { status: 500 })
    }

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: `Failed to download generated image.` }, { status: 500 })
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
