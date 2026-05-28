import { NextResponse } from "next/server"
import pg from "pg"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL

  // Mask password for safe display
  let maskedUrl = "NOT SET"
  let parsedInfo: any = {}
  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl)
      maskedUrl = `${parsed.protocol}//${parsed.username}:****@${parsed.hostname}:${parsed.port}${parsed.pathname}${parsed.search}`
      parsedInfo = {
        protocol: parsed.protocol,
        username: parsed.username,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
      }
    } catch (e: any) {
      maskedUrl = `PARSE ERROR: ${e.message}`
    }
  }

  // Attempt raw pg connection
  let connectionResult = "not attempted"
  if (dbUrl) {
    try {
      const pool = new pg.Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      })
      const client = await pool.connect()
      const res = await client.query("SELECT 1 as test")
      client.release()
      await pool.end()
      connectionResult = `SUCCESS - query returned: ${JSON.stringify(res.rows)}`
    } catch (e: any) {
      connectionResult = `FAILED - ${e.message}`
    }
  }

  return NextResponse.json({
    databaseUrl: maskedUrl,
    parsedInfo,
    connectionResult,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
