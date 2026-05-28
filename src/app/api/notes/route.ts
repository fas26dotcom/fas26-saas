import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/notes — list notes for logged-in user
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ notes })
}

// POST /api/notes — create a note for logged-in user
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, content, tags } = await request.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const tagsArray = Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [])

  const note = await prisma.note.create({
    data: {
      title,
      content: content || "",
      tags: tagsArray,
      authorId: user.id,
    },
  })

  return NextResponse.json({ note }, { status: 201 })
}

// PUT /api/notes — update an existing note
export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, title, content, tags } = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
  }

  const tagsArray = Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [])

  const note = await prisma.note.update({
    where: { id, authorId: user.id },
    data: {
      title: title || undefined,
      content: content !== undefined ? content : undefined,
      tags: tags ? tagsArray : undefined,
    },
  })

  return NextResponse.json({ note })
}

// DELETE /api/notes — delete a note
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
  }

  await prisma.note.delete({
    where: { id, authorId: user.id },
  })

  return NextResponse.json({ success: true })
}
