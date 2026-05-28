import { NextResponse } from "next/server"
import pg from "pg"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function testConnection(config: pg.PoolConfig): Promise<string> {
  try {
    const pool = new pg.Pool({ ...config, connectionTimeoutMillis: 10000 })
    const client = await pool.connect()
    const res = await client.query("SELECT 1 as test")
    client.release()
    await pool.end()
    return "SUCCESS"
  } catch (e: any) {
    return `FAILED - ${e.message}`
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" })
  }

  const password = decodeURIComponent(new URL(dbUrl).password)
  const projectRef = "zczjuvgmvufxdcthzlal"
  const sslOff = { rejectUnauthorized: false }

  const results: Record<string, string> = {}

  // 1. Exact local .env config (username=postgres, host=db.xxx.supabase.co, port=6543)
  results["local_exact_6543"] = await testConnection({
    host: `db.${projectRef}.supabase.co`,
    port: 6543,
    database: "postgres",
    user: "postgres",
    password,
    ssl: sslOff,
  })

  // 2. Direct connection port 5432
  results["direct_5432"] = await testConnection({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password,
    ssl: sslOff,
  })

  // 3. Current Vercel pooler config
  results["current_vercel"] = await testConnection({
    host: new URL(dbUrl).hostname,
    port: parseInt(new URL(dbUrl).port) || 6543,
    database: "postgres",
    user: `postgres.${projectRef}`,
    password,
    ssl: sslOff,
  })

  // 4-9. All major pooler regions with postgres.ref username
  const regions = [
    "aws-0-ap-south-1",
    "aws-0-ap-southeast-1",
    "aws-0-us-east-1",
    "aws-0-us-east-2",
    "aws-0-us-west-1",
    "aws-0-us-west-2",
    "aws-0-eu-west-1",
    "aws-0-eu-west-2",
    "aws-0-eu-central-1",
  ]

  for (const region of regions) {
    results[`pooler_${region}`] = await testConnection({
      host: `${region}.pooler.supabase.com`,
      port: 6543,
      database: "postgres",
      user: `postgres.${projectRef}`,
      password,
      ssl: sslOff,
    })
  }

  // 10. DNS resolution test
  let dnsResult = "not tested"
  try {
    const dns = require("dns").promises
    const addresses = await dns.resolve4(`db.${projectRef}.supabase.co`)
    dnsResult = `Resolved to: ${addresses.join(", ")}`
  } catch (e: any) {
    dnsResult = `DNS FAILED: ${e.message}`
  }

  return NextResponse.json({
    currentUrl: `...@${new URL(dbUrl).hostname}:${new URL(dbUrl).port}`,
    dnsLookup: dnsResult,
    results,
    timestamp: new Date().toISOString(),
  })
}
