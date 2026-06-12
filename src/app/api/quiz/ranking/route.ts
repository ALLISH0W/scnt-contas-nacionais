import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get top scores, best score per user (highest percentage, then fastest time)
    const allScores = await db.quizScore.findMany({
      orderBy: [
        { percentage: 'desc' },
        { timeSeconds: 'asc' },
        { completedAt: 'asc' },
      ],
    })

    // Keep only the best score per user email
    const bestScoresMap = new Map<string, typeof allScores[0]>()
    for (const score of allScores) {
      const existing = bestScoresMap.get(score.userEmail)
      if (!existing) {
        bestScoresMap.set(score.userEmail, score)
      }
    }

    const ranking = Array.from(bestScoresMap.values())
      .sort((a, b) => {
        // Sort by percentage desc, then by time asc
        if (b.percentage !== a.percentage) return b.percentage - a.percentage
        return a.timeSeconds - b.timeSeconds
      })
      .slice(0, 50) // Top 50
      .map((score, index) => ({
        position: index + 1,
        id: score.id,
        userName: score.userName,
        score: score.score,
        totalQuestions: score.totalQuestions,
        percentage: score.percentage,
        timeSeconds: score.timeSeconds,
        completedAt: score.completedAt.toISOString(),
      }))

    return NextResponse.json({ ranking })
  } catch (error) {
    console.error('Error fetching ranking:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar ranking' },
      { status: 500 }
    )
  }
}
