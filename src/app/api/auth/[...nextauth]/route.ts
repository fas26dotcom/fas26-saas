import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const SECRET = process.env.NEXTAUTH_SECRET || "fas26_super_secret_auth_key_32_chars"

// Lightweight, dependency-free JWT implementation for Vercel/Node.js compliance
function signToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })).toString("base64url") // 7 days expiry
  const signature = crypto.createHmac("sha256", SECRET).update(`${header}.${data}`).digest("base64url")
  return `${header}.${data}.${signature}`
}

function verifyToken(token: string): any | null {
  try {
    const [header, data, signature] = token.split(".")
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(`${header}.${data}`).digest("base64url")
    if (signature !== expectedSignature) return null
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"))
    
    // Check if expired
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

// GET handler: Returns the current active user session
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const payload = verifyToken(sessionCookie)
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        createdAt: true,
        videoGeneratedCount: true,
        audioGeneratedCount: true,
      }
    })

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user
    })
  } catch (error: any) {
    console.error("Session fetch error detailed:", error?.message || error)
    return NextResponse.json({ authenticated: false, error: error?.message }, { status: 500 })
  }
}

// POST handler: Logs user in and sets the HTTP-Only cookie
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // 1. Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // 2. Verify hashed password
    const salt = "fas26_secure_salt_key"
    const hashedInputPassword = crypto.createHmac("sha256", salt).update(password).digest("hex")

    if (user.password !== hashedInputPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // 3. Generate signed session token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name
    })

    // 4. Create response and set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name }
    })

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    })

    return response

  } catch (error: any) {
    console.error("Authentication error detailed:", error?.message || error)
    return NextResponse.json({ success: false, error: "Internal Server Error", details: error?.message }, { status: 500 })
  }
}

// DELETE handler (or POST /logout) to sign out
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })
  response.cookies.set({
    name: "session",
    value: "",
    maxAge: 0,
    path: "/"
  })
  return response
}