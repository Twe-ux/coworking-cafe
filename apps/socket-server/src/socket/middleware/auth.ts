import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
}

export async function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication token missing'))
    }

    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      return next(new Error('JWT_SECRET not configured'))
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Attach user data to socket
    socket.data.userId = decoded.userId
    socket.data.email = decoded.email

    next()
  } catch (error) {
    console.error('Socket authentication error:', error)
    next(new Error('Invalid authentication token'))
  }
}
