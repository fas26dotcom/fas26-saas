import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null

// Lazily initialize the PrismaClient only when actually queried at runtime.
// This prevents Next.js static build pre-rendering / page collection phases from instantiating 
// PrismaClient in Edge compilation containers where the database URL is undefined.
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    }
    return Reflect.get(prismaInstance, prop)
  }
})
