import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

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

    // 3. Create user in Supabase
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "USER"
      }
    })

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      userId: user.id
    })

  } catch (error: any) {
    console.error("Signup error:", error?.message || error)
    
    // Check for common deployment issues
    if (error?.message?.includes("connect") || error?.message?.includes("ECONNREFUSED") || error?.code === "ENOTFOUND") {
      return NextResponse.json({ success: false, error: "Database connection failed. Check DATABASE_URL environment variable." }, { status: 500 })
    }
    
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
