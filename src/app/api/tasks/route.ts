import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/tasks — list tasks for logged-in user
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ tasks })
}

// POST /api/tasks — create a task for logged-in user
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, priority, status } = await request.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const statusMap: Record<string, string> = {
    "todo": "TODO",
    "in-progress": "IN_PROGRESS",
    "done": "DONE",
  }
  const priorityMap: Record<string, string> = {
    "low": "LOW",
    "medium": "MEDIUM",
    "high": "HIGH",
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || "",
      status: (statusMap[status] || "TODO") as any,
      priority: (priorityMap[priority] || "MEDIUM") as any,
      userId: user.id,
    },
  })

  return NextResponse.json({ task }, { status: 201 })
}

// PUT /api/tasks — update a task for logged-in user
export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, title, description, priority, status } = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
  }

  const statusMap: Record<string, string> = {
    "todo": "TODO",
    "in-progress": "IN_PROGRESS",
    "done": "DONE",
  }
  const priorityMap: Record<string, string> = {
    "low": "LOW",
    "medium": "MEDIUM",
    "high": "HIGH",
  }

  const task = await prisma.task.update({
    where: { id, userId: user.id },
    data: {
      title: title || undefined,
      description: description !== undefined ? description : undefined,
      status: status ? (statusMap[status] as any) : undefined,
      priority: priority ? (priorityMap[priority] as any) : undefined,
    },
  })

  return NextResponse.json({ task })
}

// DELETE /api/tasks — delete a task for logged-in user
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
  }

  await prisma.task.delete({
    where: { id, userId: user.id },
  })

  return NextResponse.json({ success: true })
}
