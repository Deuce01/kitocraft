import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      phone: decoded.phone,
      role: decoded.role
    }
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, name?: string, phone?: string) {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      name,
      phone,
      role: 'CUSTOMER'
    }
  })
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // For demo purposes, we'll create a simple auth without password field in schema
  // In production, add password field to User model
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    // Create user if doesn't exist (demo mode)
    const newUser = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        role: 'CUSTOMER'
      }
    })
    return newUser
  }
  
  return user
}

export async function getCurrentUser(token?: string): Promise<User | null> {
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  })
  
  return user
}