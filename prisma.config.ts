import { defineConfig, env } from 'prisma/config'
import { config as dotenvLoad } from 'dotenv'

dotenvLoad({ path: '.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
