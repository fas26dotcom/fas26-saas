import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { sendEmailNotification } from "@/lib/email"

export const dynamic = "force-dynamic"

// GET /api/events — list calendar events for logged-in user
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ events })
}

// POST /api/events — create a calendar event for logged-in user
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, date, time, type } = await request.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "12:00 PM",
      type: type || "meeting",
      userId: user.id,
    },
  })

  // Send email notification (non-blocking)
  const subjectTitle = title.split("\n")[0].substring(0, 50) + (title.length > 50 ? "..." : "")
  sendEmailNotification({
    to: user.email,
    subject: `📅 New Event Scheduled: ${subjectTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4f46e5;">New Calendar Event</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time || "12:00 PM"}</p>
        <p><strong>Type:</strong> ${type || "meeting"}</p>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">app.fas26.com BY FAS26 - email: info@fas26.com</p>
      </div>
    `,
  }).catch(() => {})

  return NextResponse.json({ event }, { status: 201 })
}

// DELETE /api/events — delete a calendar event
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }

  const event = await prisma.calendarEvent.findUnique({
    where: { id },
  })

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  if (event.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.calendarEvent.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}

// PATCH /api/events — update a calendar event
export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }

  const event = await prisma.calendarEvent.findUnique({
    where: { id },
  })

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  if (event.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { title, date, time, type } = await request.json()

  const updatedEvent = await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: title !== undefined ? title : event.title,
      date: date !== undefined ? date : event.date,
      time: time !== undefined ? time : event.time,
      type: type !== undefined ? type : event.type,
    },
  })

  return NextResponse.json({ event: updatedEvent })
}

