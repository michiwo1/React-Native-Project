import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateToken } from './utils/jwt'
import { authenticate } from './middleware/auth'
import bcrypt from 'bcrypt'
import userRoutes from './routes/user.routes'

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
  next();
});

// Mount user routes
app.use('/api', userRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Signup endpoint
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        display_name: displayName || email.split('@')[0]
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected data', userId: req.user?.userId });
});

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
