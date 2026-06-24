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
    const openAiKey = process.env.OPENAI_API_KEY

    const start = startDate ? new Date(startDate) : new Date()
    const planDuration = duration ? parseInt(duration) : 10

    // Prompt for structured JSON output
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

    let plannerItems: any[] | null = null
    let providerUsed = "None"

    // 1. Try Gemini
    if (geminiKey) {
      try {
        console.log("Attempting plan generation with Google Gemini...")
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

        if (response.ok) {
          const data = await response.json()
          const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (textContent) {
            let cleanedJson = textContent.trim()
            if (cleanedJson.startsWith("```")) {
              cleanedJson = cleanedJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim()
            }
            const parsed = JSON.parse(cleanedJson)
            if (Array.isArray(parsed)) {
              plannerItems = parsed
              providerUsed = "Google Gemini"
            }
          }
        } else {
          console.error("Gemini batch planner API returned error:", await response.text())
        }
      } catch (geminiErr: any) {
        console.error("Gemini batch planner exception:", geminiErr.message)
      }
    }

    // 2. Try OpenAI Fallback
    if (!plannerItems && openAiKey) {
      try {
        console.log("Attempting plan generation with OpenAI...")
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const textContent = data.choices?.[0]?.message?.content
          if (textContent) {
            let cleanedJson = textContent.trim()
            if (cleanedJson.startsWith("```")) {
              cleanedJson = cleanedJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim()
            }
            const parsed = JSON.parse(cleanedJson)
            if (Array.isArray(parsed)) {
              plannerItems = parsed
              providerUsed = "OpenAI"
            }
          }
        } else {
          console.error("OpenAI planner API returned error:", await response.text())
        }
      } catch (openAiErr: any) {
        console.error("OpenAI planner exception:", openAiErr.message)
      }
    }

    // 3. Fallback to Mock Sandbox Planner
    if (!plannerItems) {
      console.log("Both AI engines failed or keys are missing. Generating Sandbox Mock Plan...")
      const mockThemes = [
        "Introduction to the campaign theme and key objectives.",
        "Crucial benefits of our approach and why it matters.",
        "Step-by-step tutorial or quick action items.",
        "Interactive question or poll to engage the audience.",
        "An inspiring quote or industry statistic.",
        "Common mistakes to avoid and how to fix them.",
        "Case study or success story highlighting results.",
        "Tools and resources we recommend for this journey.",
        "Quick tips and hacks for immediate implementation.",
        "Debunking popular myths or misconceptions.",
        "Q&A session or answering frequently asked questions.",
        "Behind-the-scenes look or personal story.",
        "A deep dive into advanced techniques.",
        "Summary of key takeaways and next steps.",
        "Call to action: How to get started today."
      ]

      plannerItems = []
      providerUsed = "FAS26 Sandbox Planner"

      for (let i = 1; i <= planDuration; i++) {
        const currentDate = new Date(start)
        currentDate.setDate(start.getDate() + i - 1)
        const dateStr = currentDate.toISOString().split("T")[0]
        
        const themeIndex = (i - 1) % mockThemes.length
        const theme = mockThemes[themeIndex]
        
        plannerItems.push({
          day: i,
          date: dateStr,
          time: "10:00 AM",
          title: `Day ${i}: Guide to ${topic}`,
          postContent: `🚀 Day ${i} of our campaign on "${topic}"! 

Today we're focusing on: ${theme}

Targeting our amazing audience of ${audience || "general practitioners"}. What are your thoughts on this? Let us know in the comments below! 👇

#${platform} #${topic.replace(/\s+/g, "")} #SaaS #Growth`,
          imagePrompt: `A professional 3D vector illustration showing a concept related to: ${theme}. Minimalist, sleek design, blue and purple gradient background, high resolution.`
        })
      }
    }

    // Save events to database in bulk
    const eventRecords = plannerItems.map((item: any) => {
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
      message: `Campaign generated successfully using ${providerUsed}!`,
      plan: plannerItems,
      provider: providerUsed
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
