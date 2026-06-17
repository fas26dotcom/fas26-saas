import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendEmailNotification } from "@/lib/email"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 })
    }

    // 2. Hash password securely using native Node.js crypto (SHA-256 HMAC)
    const salt = "fas26_secure_salt_key"
    const hashedPassword = crypto.createHmac("sha256", salt).update(password).digest("hex")

    // Generate secure random verification token and expiry (24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date(Date.now() + 86400000) // 24 hours

    // 3. Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "USER",
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
      }
    })

    // Send verification email
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verifyLink = `${appUrl}/auth/verify?token=${verificationToken}`

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to FAS26!</h2>
        <p>Hi ${name || "there"},</p>
        <p>Thank you for signing up for FAS26 SaaS. Please verify your email address to active your account by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours. If you did not sign up for this account, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">FAS26 Inc. • Sydney, Australia</p>
      </div>
    `

    await sendEmailNotification({
      to: user.email,
      subject: "FAS26 - Verify Your Email Address",
      html: emailHtml
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      userId: user.id
    })

  } catch (error: any) {
    console.error("Signup error:", error?.message || error)
    
    return NextResponse.json({ 
      success: false, 
      error: "Database connection failed. Check DATABASE_URL environment variable.",
      details: error?.message || String(error),
      code: error?.code
    }, { status: 500 })
  }

}
