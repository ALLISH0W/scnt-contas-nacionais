import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple hash function for simulating auth (NOT for production use)
// Must match the hash function used in register
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  // Combine with a salt-like prefix and base64 encode for storage
  const salted = `ibge_auth_${hash}_${password.length}_v1`
  return Buffer.from(salted).toString('base64')
}

interface LoginBody {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginBody = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const hashedPassword = simpleHash(password)
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Error logging in user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log in' },
      { status: 500 }
    )
  }
}
