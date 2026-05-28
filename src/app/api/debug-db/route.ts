import { NextResponse } from "next/server"
import pg from "pg"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function testConnection(label: string, config: pg.PoolConfig): Promise<string> {
  try {
    const pool = new pg.Pool({ ...config, connectionTimeoutMillis: 8000 })
    const client = await pool.connect()
    const res = await client.query("SELECT 1 as test")
    client.release()
    await pool.end()
    return `SUCCESS`
  } catch (e: any) {
    return `FAILED - ${e.message}`
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" })
  }

  const parsed = new URL(dbUrl)
  const password = decodeURIComponent(parsed.password)
  const projectRef = "zczjuvgmvufxdcthzlal"

  // Common connection settings
  const baseConfig = {
    database: "postgres",
    user: `postgres.${projectRef}`,
    password,
    ssl: { rejectUnauthorized: false },
  }

  // Test multiple configurations in parallel
  const results: Record<string, string> = {}

  // 1. Direct database connection (port 5432, no pooler)
  results["direct_5432"] = await testConnection("direct", {
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",  // direct connection uses plain "postgres"
    password,
    ssl: { rejectUnauthorized: false },
  })

  // 2. Try the pooler host from the current DATABASE_URL
  results[`current_pooler_${parsed.hostname}`] = await testConnection("current", {
    ...baseConfig,
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6543,
  })

  // 3. Try common Supabase pooler regions
  const regions = [
    "aws-0-ap-south-1",
    "aws-0-ap-southeast-1", 
    "aws-0-us-west-1",
    "aws-0-eu-west-1",
    "aws-0-eu-central-1",
  ]

  for (const region of regions) {
    const host = `${region}.pooler.supabase.com`
    results[`pooler_${region}`] = await testConnection(region, {
      ...baseConfig,
      host,
      port: 6543,
    })
  }

  return NextResponse.json({
    currentUrl: `${parsed.protocol}//${parsed.username}:****@${parsed.hostname}:${parsed.port}${parsed.pathname}`,
    results,
    timestamp: new Date().toISOString(),
  })
}
