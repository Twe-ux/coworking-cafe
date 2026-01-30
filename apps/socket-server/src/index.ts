import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './lib/mongodb'
import { authMiddleware } from './socket/middleware/auth'
import { setupMessageHandlers, setupConversationHandlers, setupTypingHandlers } from './socket/handlers'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// Health check endpoint (both /health and /api/health for Northflank compatibility)
const healthCheckHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
app.get('/health', healthCheckHandler)
app.get('/api/health', healthCheckHandler)

// Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

// Socket.io authentication middleware
io.use(authMiddleware)

// Socket.io connection handler
io.on('connection', (socket) => {
  const userId = socket.data.userId
  console.log(`Client connected: ${socket.id} (User: ${userId})`)

  // Setup event handlers
  setupConversationHandlers(io, socket)
  setupMessageHandlers(io, socket)
  setupTypingHandlers(io, socket)

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id} (Reason: ${reason})`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error)
  })
})

// Start server
const PORT = process.env.PORT || 3002

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`✅ Socket.io server running on port ${PORT}`)
      console.log(`✅ Environment: ${process.env.NODE_ENV}`)
      console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`)
    })
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  })

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
