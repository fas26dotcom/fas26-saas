import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { checkAndPublishDuePosts } from "@/lib/scheduler"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: user.id }
    })

    if (!workspace) {
      return NextResponse.json({ connected: false })
    }

    // Trigger opportunistic background publication check for this user's workspace
    checkAndPublishDuePosts(workspace.id).catch((err) => {
      console.error("Opportunistic background publication error:", err)
    })

    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: workspace.id,
        name: "linkedin"
      }
    })

    if (!integration || !integration.config) {
      return NextResponse.json({ connected: false })
    }

    const config: any = integration.config
    return NextResponse.json({
      connected: true,
      personName: config.personName || "LinkedIn User",
      isSimulated: !!config.isSimulated
    })

  } catch (error: any) {
    console.error("LinkedIn status check error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: user.id }
    })

    if (!workspace) {
      return NextResponse.json({ success: true })
    }

    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: workspace.id,
        name: "linkedin"
      }
    })

    if (integration) {
      await prisma.integration.delete({
        where: { id: integration.id }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("LinkedIn disconnect error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
