import { create } from 'zustand'
import { toast } from 'sonner'

export interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  showLoginDialog: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  setShowLoginDialog: (show: boolean) => void
}

// Simple hash for password storage (demo purposes)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const salted = `scnt_auth_${hash}_${password.length}_v1`
  return Buffer.from(salted).toString('base64')
}

// localStorage-based user storage (works on both local and Vercel)
function getStoredUsers(): Array<{ id: string; email: string; name: string; password: string }> {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('scnt_users')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveStoredUsers(users: Array<{ id: string; email: string; name: string; password: string }>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('scnt_users', JSON.stringify(users))
}

function getStoredSession(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem('scnt_session')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveStoredSession(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('scnt_session', JSON.stringify(user))
  } else {
    localStorage.removeItem('scnt_session')
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  showLoginDialog: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const users = getStoredUsers()
      const user = users.find(u => u.email === email.toLowerCase())

      if (!user) {
        throw new Error('Email ou senha incorretos')
      }

      const hashedPassword = simpleHash(password)
      if (user.password !== hashedPassword) {
        throw new Error('Email ou senha incorretos')
      }

      const sessionUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
      }

      saveStoredSession(sessionUser)
      set({
        user: sessionUser,
        isAuthenticated: true,
        showLoginDialog: false,
      })
      toast.success('Login realizado com sucesso!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      toast.error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true })
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido')
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
      }

      const users = getStoredUsers()
      const existingUser = users.find(u => u.email === email.toLowerCase())

      if (existingUser) {
        throw new Error('Já existe uma conta com este email')
      }

      const hashedPassword = simpleHash(password)
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        password: hashedPassword,
      }

      users.push(newUser)
      saveStoredUsers(users)

      const sessionUser: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }

      saveStoredSession(sessionUser)
      set({
        user: sessionUser,
        isAuthenticated: true,
        showLoginDialog: false,
      })
      toast.success('Conta criada com sucesso!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta'
      toast.error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    saveStoredSession(null)
    set({
      user: null,
      isAuthenticated: false,
    })
    toast.success('Logout realizado com sucesso')
  },

  setShowLoginDialog: (show: boolean) => {
    set({ showLoginDialog: show })
  },
}))

// Hydrate from localStorage on client side
if (typeof window !== 'undefined') {
  const session = getStoredSession()
  if (session) {
    useAuthStore.setState({
      user: session,
      isAuthenticated: true,
    })
  }
}
