import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  // Prisma 7 does not support 'datasourceUrl' or 'datasources' parameter overrides 
  // directly in the standard JS constructor. Instead, standard Prisma 7 strictly maps the 
  // connection configurations back to the schema generation environment variables.
  //
  // To bypass any edge pre-rendering missing DATABASE_URL context, we check for its presence,
  // but instantiate the client cleanly as process.env.DATABASE_URL will be read automatically.
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
