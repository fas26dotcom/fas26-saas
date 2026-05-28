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

      // Use standard, safe URL parsing to cleanly remove the sslmode query parameter
      let cleanConnectionString = connectionString
      try {
        const parsedUrl = new URL(connectionString)
        parsedUrl.searchParams.delete('sslmode')
        cleanConnectionString = parsedUrl.toString()
      } catch (e) {
        console.error("Failed to parse DATABASE_URL as a URL object:", e)
      }

      const pool = new pg.Pool({
        connectionString: cleanConnectionString,
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

