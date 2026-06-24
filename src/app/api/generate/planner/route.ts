import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { topic, platform, audience, startDate, duration } = await request.json()

    if (!topic || !platform) {
      return NextResponse.json({ success: false, error: "Topic and platform are required" }, { status: 400 })
    }

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file." 
      }, { status: 500 })
    }

    const start = startDate ? new Date(startDate) : new Date()
    const planDuration = duration ? parseInt(duration) : 10

    // Prompt Gemini for structured JSON output
    const prompt = `
Generate a comprehensive ${planDuration}-day social media campaign and content schedule.
Topic/Theme: "${topic}"
Target Platform: "${platform}"
Target Audience: "${audience || "General Public"}"
Campaign Start Date: "${start.toISOString().split("T")[0]}"

You MUST return a valid JSON array of exactly ${planDuration} objects. Do not wrap the JSON in markdown code blocks. Return ONLY the raw JSON array.
Each object in the array must contain:
1. "day": A number from 1 to ${planDuration}.
2. "date": The calendar date formatted as "YYYY-MM-DD" starting from the Campaign Start Date (incrementing by 1 day for each day).
3. "time": An optimal posting time (e.g. "09:00 AM", "02:30 PM").
4. "title": A short, catchy title (5-8 words) describing the post theme.
5. "postContent": The complete, fully written social media post copy for the platform (include emojis and relevant hashtags).
6. "imagePrompt": A highly detailed prompt to generate a stunning, contextually relevant matching image using an AI image generator.

JSON Format Schema:
[
  {
    "day": 1,
    "date": "YYYY-MM-DD",
    "time": "10:00 AM",
    "title": "Title Here",
    "postContent": "Post content here...",
    "imagePrompt": "A highly detailed image generation prompt describing the scene..."
  },
  ...
]
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini batch planner API returned error:", errorText)
      return NextResponse.json({ success: false, error: "Failed to generate plan from AI provider." }, { status: 500 })
    }

    const data = await response.json()
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textContent) {
      return NextResponse.json({ success: false, error: "AI provider returned empty response." }, { status: 500 })
    }

    // Clean markdown code blocks if any
    let cleanedJson = textContent.trim()
    if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim()
    }

    const plannerItems = JSON.parse(cleanedJson)

    if (!Array.isArray(plannerItems)) {
      return NextResponse.json({ success: false, error: "AI did not return a valid array." }, { status: 500 })
    }

    // Save events to database in bulk
    const eventRecords = plannerItems.map((item: any) => {
      // Clean and structure the title to hold both title, content, and prompt
      const fullTitle = `[${platform.toUpperCase()}] ${item.title}\n\n${item.postContent}\n\n[AI Image Prompt]: ${item.imagePrompt}`
      return {
        title: fullTitle,
        date: item.date,
        time: item.time || "10:00 AM",
        type: "social",
        userId: user.id
      }
    })

    await prisma.calendarEvent.createMany({
      data: eventRecords
    })

    return NextResponse.json({
      success: true,
      message: "30-day planner generated and scheduled successfully!",
      plan: plannerItems
    })

  } catch (error: any) {
    console.error("Batch planner route error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal Server Error",
      details: error.message 
    }, { status: 500 })
  }
}
