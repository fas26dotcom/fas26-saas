import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

let prismaInstance: PrismaClient | null = null

// Lazily initialize the PrismaClient with the pg driver adapter as required by Prisma 7.
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      const connectionString = process.env.DATABASE_URL
      if (!connectionString) {
        throw new Error("DATABASE_URL is not set")
      }

      // Parse the URL into individual connection parameters to completely avoid
      // sslmode query parameter conflicts with our explicit SSL configuration.
      // Passing a connectionString lets pg re-parse sslmode=require and override
      // our { rejectUnauthorized: false }, causing self-signed cert errors.
      const parsed = new URL(connectionString)

      const pool = new pg.Pool({
        host: parsed.hostname,
        port: parseInt(parsed.port) || 6543,
        database: parsed.pathname.slice(1), // remove leading "/"
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        ssl: { rejectUnauthorized: false },
      })
      const adapter = new PrismaPg(pool)

      prismaInstance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    }
    return Reflect.get(prismaInstance, prop)
  }
})

