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

      // Strip any sslmode query parameter to prevent conflicts with our manual SSL settings
      const cleanConnectionString = connectionString.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')

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

