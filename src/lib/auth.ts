import crypto from "crypto"
import { NextRequest } from "next/server"

const SECRET = process.env.NEXTAUTH_SECRET || "fas26_super_secret_auth_key_32_chars"

export function verifyToken(token: string): any | null {
  try {
    const [header, data, signature] = token.split(".")
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(`${header}.${data}`).digest("base64url")
    if (signature !== expectedSignature) return null
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"))
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): { id: string; email: string; name: string } | null {
  const sessionCookie = request.cookies.get("session")?.value
  if (!sessionCookie) return null
  const payload = verifyToken(sessionCookie)
  if (!payload) return null
  return { id: payload.id, email: payload.email, name: payload.name }
}
