import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const SECRET = process.env.NEXTAUTH_SECRET || "fas26_super_secret_auth_key_32_chars"

function verifyToken(token: string): any | null {
  try {
    const [header, data, signature] = token.split(".")
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(`${header}.${data}`).digest("base64url")
    if (signature !== expectedSignature) return null
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"))
    
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false })
    }

    const payload = verifyToken(sessionCookie)
    if (!payload) {
      return NextResponse.json({ authenticated: false })
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
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user
    })
  } catch (error) {
    console.error("Session verification error:", error)
    return NextResponse.json({ authenticated: false })
  }
}

