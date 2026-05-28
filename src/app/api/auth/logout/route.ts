import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })
  response.cookies.set({
    name: "session",
    value: "",
    maxAge: 0,
    path: "/"
  })
  return response
}
export async function GET() {
  const response = NextResponse.redirect(new URL("/auth", "http://localhost:3000")) // standard redirect
  response.cookies.set({
    name: "session",
    value: "",
    maxAge: 0,
    path: "/"
  })
  return response
}
