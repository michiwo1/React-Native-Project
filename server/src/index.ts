import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateToken } from './utils/jwt'
import { authenticate } from './middleware/auth'
import bcrypt from 'bcrypt'
import userRoutes from './routes/user.routes'
import exerciseRoutes from './routes/exercise.routes'
import workoutRoutes from './routes/workout.routes'
import authRoutes from './routes/auth.routes'
import planRoutes from './routes/plan.routes'
import measurementRoutes from './routes/measurement.routes'
import mealRoutes from './routes/meal.routes'
import aiRoutes from './routes/ai.routes'

dotenv.config()

const prisma = new PrismaClient()
const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Public routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Auth routes
app.use('/api/auth', authRoutes);

// Exercise routes (protected)
app.use('/api/exercise', authenticate, exerciseRoutes);

// Workout routes (protected)
app.use('/api/workout', authenticate, workoutRoutes);

// User routes (protected)
app.use('/api/user', authenticate, userRoutes);

// Plan routes (protected)
app.use('/api/plan', authenticate, planRoutes);

// Measurement routes (protected)
app.use('/api/measurement', authenticate, measurementRoutes);

// Meal routes (protected)
app.use('/api/meal', authenticate, mealRoutes);

// AI routes (protected)
app.use('/api/ai', authenticate, aiRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

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
