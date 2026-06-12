'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Trophy, Medal, RefreshCw, Crown, Timer, Target, Users,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

interface RankingEntry {
  position: number
  id: string
  userName: string
  score: number
  totalQuestions: number
  percentage: number
  timeSeconds: number
  completedAt: string
}

export function RankingSection() {
  const { user, isAuthenticated } = useAuthStore()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRanking = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/quiz/ranking')
      if (!res.ok) throw new Error('Erro ao carregar ranking')
      const data = await res.json()
      setRanking(data.ranking)
    } catch {
      setError('Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRanking()
  }, [])

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return null
  }

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    if (position === 2) return 'bg-gray-400/10 text-gray-500 border-gray-400/20'
    if (position === 3) return 'bg-amber-600/10 text-amber-700 border-amber-600/20'
    return 'bg-muted text-muted-foreground border-border'
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  return (
    <section id="ranking" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Ranking
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ranking dos <span className="text-emerald-600">Melhores</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Veja quem mais acerta as perguntas sobre o SCNT e a economia brasileira.
            Os melhores resultados por jogador são exibidos aqui.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchRanking}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : ranking.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum resultado ainda</h3>
              <p className="text-muted-foreground mb-6">
                Seja o primeiro a completar o quiz e aparecer no ranking!
              </p>
              {isAuthenticated ? (
                <a href="#quiz">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Target className="w-4 h-4 mr-2" />
                    Fazer Quiz
                  </Button>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Faça login e complete o quiz para entrar no ranking</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Podium - Top 3 */}
            {ranking.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[ranking[1], ranking[0], ranking[2]].map((entry, idx) => {
                  const actualPos = idx === 0 ? 2 : idx === 1 ? 1 : 3
                  const isFirst = actualPos === 1
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className={`text-center ${
                        isFirst
                          ? 'border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent sm:-mt-4'
                          : actualPos === 2
                            ? 'border-gray-400/20'
                            : 'border-amber-600/20'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex justify-center mb-3">
                            {getPositionIcon(actualPos)}
                          </div>
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-2 ${getPositionBadge(actualPos)}`}>
                            {actualPos}º
                          </div>
                          <h4 className="font-bold text-base mb-1 truncate">
                            {entry.userName}
                          </h4>
                          <div className="text-2xl font-bold text-emerald-600 mb-1">
                            {entry.percentage}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.score}/{entry.totalQuestions} acertos · {formatTime(entry.timeSeconds)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Full ranking list */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    Classificação Completa
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={fetchRanking}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-3 pr-2 w-12">#</th>
                        <th className="pb-3 pr-2">Jogador</th>
                        <th className="pb-3 pr-2 text-center">Acertos</th>
                        <th className="pb-3 pr-2 text-center">Aproveitamento</th>
                        <th className="pb-3 text-center hidden sm:table-cell">Tempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((entry, idx) => {
                        const isCurrentUser = user && user.email === entry.userEmail
                        return (
                          <motion.tr
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`border-b last:border-0 transition-colors ${
                              isCurrentUser ? 'bg-emerald-500/5' : 'hover:bg-muted/50'
                            }`}
                          >
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-1">
                                {getPositionIcon(entry.position) || (
                                  <span className="text-sm text-muted-foreground font-medium w-5 text-center">
                                    {entry.position}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isCurrentUser
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {entry.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium truncate max-w-[120px] sm:max-w-[200px] ${
                                    isCurrentUser ? 'text-emerald-600' : ''
                                  }`}>
                                    {entry.userName}
                                    {isCurrentUser && (
                                      <span className="text-xs ml-1">(você)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-2 text-center">
                              <span className="text-sm font-medium">{entry.score}/{entry.totalQuestions}</span>
                            </td>
                            <td className="py-3 pr-2 text-center">
                              <Badge
                                variant={entry.percentage >= 70 ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  entry.percentage >= 70
                                    ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                                    : ''
                                }`}
                              >
                                {entry.percentage}%
                              </Badge>
                            </td>
                            <td className="py-3 text-center hidden sm:table-cell">
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <Timer className="w-3 h-3" />
                                {formatTime(entry.timeSeconds)}
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  )
}
