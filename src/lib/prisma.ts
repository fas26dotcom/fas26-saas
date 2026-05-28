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

      const pool = new pg.Pool({
        connectionString,
        ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : undefined,
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

