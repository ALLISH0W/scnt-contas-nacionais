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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  showLoginDialog: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      set({
        user: data.user,
        isAuthenticated: true,
        showLoginDialog: false,
      })
      toast.success('Logged in successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      set({
        user: data.user,
        isAuthenticated: true,
        showLoginDialog: false,
      })
      toast.success('Account created successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      toast.error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    })
    toast.success('Logged out successfully')
  },

  setShowLoginDialog: (show: boolean) => {
    set({ showLoginDialog: show })
  },
}))
