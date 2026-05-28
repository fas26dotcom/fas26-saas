import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: "Token and new password are required" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid or expired recovery token." }, { status: 400 })
    }

    // Securely hash the password natively matching your signup structure
    const salt = "fas26_secure_salt_key"
    const hashedNewPassword = crypto.createHmac("sha256", salt).update(newPassword).digest("hex")

    // Update the password and revoke the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! Please log in."
    })

  } catch (error: any) {
    console.error("Reset password execution error:", error?.message || error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
