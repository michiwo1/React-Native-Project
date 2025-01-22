import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Initialize Prisma client and start server
async function main() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to database')

    const port = process.env.PORT || 3000
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
