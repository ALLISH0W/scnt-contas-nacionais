import { create } from 'zustand'

export interface QuizScoreEntry {
  id: string
  userName: string
  userEmail: string
  score: number
  totalQuestions: number
  percentage: number
  timeSeconds: number
  completedAt: string // ISO string for localStorage compatibility
}

interface QuizState {
  scores: QuizScoreEntry[]
  addScore: (entry: Omit<QuizScoreEntry, 'id' | 'completedAt'>) => void
  getRanking: () => QuizScoreEntry[]
  getBestRanking: () => QuizScoreEntry[]
  getUserBestScore: (email: string) => QuizScoreEntry | null
}

const STORAGE_KEY = 'scnt_quiz_scores'

function loadScores(): QuizScoreEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveScores(scores: QuizScoreEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export const useQuizStore = create<QuizState>((set, get) => ({
  scores: [],

  addScore: (entry) => {
    const newEntry: QuizScoreEntry = {
      ...entry,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      completedAt: new Date().toISOString(),
    }

    set((state) => {
      const updated = [...state.scores, newEntry]
      saveScores(updated)
      return { scores: updated }
    })
  },

  getRanking: () => {
    const { scores } = get()
    return [...scores].sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage
      return a.timeSeconds - b.timeSeconds
    })
  },

  getBestRanking: () => {
    const { scores } = get()
    // Keep only the best score per user email
    const bestMap = new Map<string, QuizScoreEntry>()
    for (const score of scores) {
      const existing = bestMap.get(score.userEmail)
      if (!existing || score.percentage > existing.percentage || 
          (score.percentage === existing.percentage && score.timeSeconds < existing.timeSeconds)) {
        bestMap.set(score.userEmail, score)
      }
    }

    return Array.from(bestMap.values())
      .sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage
        return a.timeSeconds - a.timeSeconds
      })
      .map((entry, index) => ({ ...entry, position: index + 1 }))
  },

  getUserBestScore: (email: string) => {
    const { scores } = get()
    const userScores = scores.filter(s => s.userEmail === email)
    if (userScores.length === 0) return null
    return userScores.reduce((best, curr) =>
      curr.percentage > best.percentage || 
      (curr.percentage === best.percentage && curr.timeSeconds < best.timeSeconds)
        ? curr : best
    )
  },
}))

// Hydrate from localStorage on client side
if (typeof window !== 'undefined') {
  const stored = loadScores()
  if (stored.length > 0) {
    useQuizStore.setState({ scores: stored })
  }
}
