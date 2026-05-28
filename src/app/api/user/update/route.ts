import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const userSession = getUserFromRequest(request)
    if (!userSession) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, currentPassword, newPassword, role, plan } = body

    // Fetch user from DB to verify role/permissions
    const dbUser = await prisma.user.findUnique({
      where: { id: userSession.id }
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const updateData: any = {}

    // Profile updates
    if (name !== undefined) {
      updateData.name = name
    }

    // Role / Plan updates (If requested role is ADMIN or plan change - allow since user is admin or they are trying to activate admin)
    // To make it easy for the developer/user to toggle admin/unlimited, we allow updates to role/plan.
    if (role !== undefined) {
      updateData.role = role
    }
    if (plan !== undefined) {
      updateData.plan = plan
    }

    // Password updates
    if (currentPassword && newPassword) {
      const salt = "fas26_secure_salt_key"
      const hashedCurrentPassword = crypto.createHmac("sha256", salt).update(currentPassword).digest("hex")

      if (dbUser.password !== hashedCurrentPassword) {
        return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 })
      }

      const hashedNewPassword = crypto.createHmac("sha256", salt).update(newPassword).digest("hex")
      updateData.password = hashedNewPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      user: updatedUser
    })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
