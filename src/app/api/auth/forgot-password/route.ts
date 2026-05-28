import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendEmailNotification } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Security: Do not leak whether the email exists in our system.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If that email is registered, a password recovery link has been sent."
      })
    }

    // Generate a secure random token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    const appUrl = process.env.NEXTAUTH_URL || "https://fas26-saas.vercel.app"
    const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-xl: 12px;">
        <h2 style="color: #4f46e5;">FAS26 Password Recovery</h2>
        <p>Hi ${user.name || "there"},</p>
        <p>We received a request to reset your FAS26 SaaS password. Click the button below to secure a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `

    await sendEmailNotification({
      to: user.email,
      subject: "FAS26 SaaS - Password Recovery Link",
      html: emailHtml
    })

    return NextResponse.json({
      success: true,
      message: "If that email is registered, a password recovery link has been sent."
    })

  } catch (error: any) {
    console.error("Forgot password request error:", error?.message || error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
