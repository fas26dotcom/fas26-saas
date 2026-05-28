import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get("prompt") || "Welcome to FAS26 AI"

    // Google Translate TTS is a high-speed, globally whitelisted speech synthesis API
    // We slice the prompt to the first 200 characters (Google TTS limit per single request)
    const voiceText = prompt.length > 200 ? prompt.substring(0, 197) + "..." : prompt
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(voiceText)}`

    // Stream the speech audio with standard browser headers to bypass hotlinking restrictions
    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to generate custom audio" }, { status: response.status })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Audio proxy failed:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
