'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Brain, CheckCircle2, XCircle, LogIn, ArrowRight,
  RotateCcw, Trophy, Clock, Zap, Target, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  category: string
}

interface LocalResult {
  questionId: number
  correct: boolean
  userAnswer: number
  correctIndex: number
  explanation: string
}

type QuizState = 'idle' | 'loading' | 'playing' | 'submitting' | 'results'

export function QuizSection() {
  const { isAuthenticated, user, setShowLoginDialog } = useAuthStore()
  const [quizState, setQuizState] = useState<QuizState>('idle')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [localResults, setLocalResults] = useState<LocalResult[]>([])
  const [score, setScore] = useState(0)
  const [percentage, setPercentage] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  // Timer effect
  useEffect(() => {
    if (quizState !== 'playing') return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [quizState, startTime])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const startQuiz = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setQuizState('loading')
    try {
      const res = await fetch('/api/quiz')
      if (!res.ok) throw new Error('Erro ao carregar quiz')
      const data = await res.json()
      setQuestions(data.questions)
      setAnswers({})
      setSelectedOption(null)
      setCurrentIndex(0)
      setLocalResults([])
      setScore(0)
      setPercentage(0)
      setShowExplanation(false)
      setStartTime(Date.now())
      setElapsedTime(0)
      setQuizState('playing')
    } catch {
      toast.error('Erro ao carregar perguntas do quiz')
      setQuizState('idle')
    }
  }, [isAuthenticated, setShowLoginDialog])

  const handleSelectOption = (optionIndex: number) => {
    if (showExplanation) return
    setSelectedOption(optionIndex)
  }

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return
    const currentQ = questions[currentIndex]
    const isCorrect = selectedOption === currentQ.correctIndex

    setAnswers(prev => ({ ...prev, [currentQ.id]: selectedOption }))
    setLocalResults(prev => [...prev, {
      questionId: currentQ.id,
      correct: isCorrect,
      userAnswer: selectedOption,
      correctIndex: currentQ.correctIndex,
      explanation: currentQ.explanation,
    }])
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowExplanation(false)
    } else {
      submitQuiz()
    }
  }

  const submitQuiz = async () => {
    if (!user) return
    setQuizState('submitting')
    try {
      const timeSeconds = Math.floor((Date.now() - startTime) / 1000)
      const totalQuestions = questions.length
      const finalScore = score
      const finalPercentage = Math.round((finalScore / totalQuestions) * 100 * 100) / 100

      setPercentage(finalPercentage)

      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user.name || user.email.split('@')[0],
          userEmail: user.email,
          answers,
          timeSeconds,
        }),
      })
      if (!res.ok) throw new Error('Erro ao enviar respostas')

      setQuizState('results')
      toast.success(`Quiz finalizado! Você acertou ${finalScore} de ${totalQuestions}!`)
    } catch {
      toast.error('Erro ao enviar respostas')
      setQuizState('idle')
    }
  }

  // Idle state - show quiz intro
  if (quizState === 'idle') {
    return (
      <section id="quiz" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              Quiz SCNT
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Teste seus <span className="text-emerald-600">Conhecimentos</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              15 perguntas sobre o Sistema de Contas Nacionais Trimestrais, dados do IBGE e economia brasileira.
              Faça login para participar e conquistar seu lugar no ranking!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto"
          >
            <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quiz SCNT</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>15 perguntas sobre economia e SCNT</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span>Dados reais do IBGE</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>Ranking dos melhores</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Tempo cronometrado</span>
                  </div>
                </div>
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={startQuiz}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Iniciar Quiz
                  </Button>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Faça login para participar do quiz e aparecer no ranking
                    </p>
                    <Button
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setShowLoginDialog(true)}
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Entrar para Jogar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    )
  }

  // Loading state
  if (quizState === 'loading') {
    return (
      <section id="quiz" className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </section>
    )
  }

  // Playing state
  if (quizState === 'playing') {
    const currentQ = questions[currentIndex]
    const progress = ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100
    const currentResult = localResults.find(r => r.questionId === currentQ.id)
    const isCurrentCorrect = currentResult?.correct ?? false

    return (
      <section id="quiz" className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Quiz SCNT</h3>
                <p className="text-sm text-muted-foreground">
                  Pergunta {currentIndex + 1} de {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedTime)}
              </Badge>
              <Badge variant="secondary">{currentQ.category}</Badge>
            </div>
          </div>

          {/* Progress */}
          <Progress value={progress} className="mb-8 h-2" />

          {/* Score tracker */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">{score}</span>
              <span className="text-muted-foreground">acertos</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600 font-medium">{localResults.length - score}</span>
              <span className="text-muted-foreground">erros</span>
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl leading-relaxed">
                    {currentQ.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQ.options.map((option, idx) => {
                    let optionStyle = 'border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer'

                    if (showExplanation) {
                      if (idx === currentQ.correctIndex) {
                        optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                      } else if (idx === selectedOption && idx !== currentQ.correctIndex) {
                        optionStyle = 'border-red-500 bg-red-500/10 text-red-700'
                      } else {
                        optionStyle = 'border-border opacity-50'
                      }
                    } else if (idx === selectedOption) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/10'
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={showExplanation}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            showExplanation
                              ? idx === currentQ.correctIndex
                                ? 'bg-emerald-500 text-white'
                                : idx === selectedOption
                                  ? 'bg-red-500 text-white'
                                  : 'bg-muted text-muted-foreground'
                              : idx === selectedOption
                                ? 'bg-emerald-500 text-white'
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm sm:text-base">{option}</span>
                          {showExplanation && (
                            <div className="ml-auto">
                              {idx === currentQ.correctIndex ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : idx === selectedOption ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card className={`border-l-4 ${isCurrentCorrect ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {isCurrentCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">
                          {isCurrentCorrect ? 'Correto!' : 'Incorreto'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentQ.explanation}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            {!showExplanation ? (
              <Button
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirmar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Próxima
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Ver Resultado
                    <Trophy className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Submitting state
  if (quizState === 'submitting') {
    return (
      <section id="quiz" className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Calculando resultado...</h3>
            <p className="text-muted-foreground">Aguarde enquanto processamos suas respostas</p>
          </motion.div>
        </div>
      </section>
    )
  }

  // Results state
  if (quizState === 'results') {
    const getEmoji = () => {
      if (percentage >= 90) return '🏆'
      if (percentage >= 70) return '🎉'
      if (percentage >= 50) return '💪'
      return '📚'
    }
    const getMessage = () => {
      if (percentage >= 90) return 'Excelente! Você é um expert em SCNT!'
      if (percentage >= 70) return 'Muito bom! Você conhece bem o SCNT!'
      if (percentage >= 50) return 'Bom trabalho! Continue estudando!'
      return 'Continue aprendendo! Tente novamente!'
    }

    return (
      <section id="quiz" className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <Card className="border-2 border-emerald-500/20">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">{getEmoji()}</div>
                <h3 className="text-2xl font-bold mb-2">Quiz Finalizado!</h3>
                <p className="text-muted-foreground mb-6">{getMessage()}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-emerald-500/10 rounded-xl p-4">
                    <div className="text-3xl font-bold text-emerald-600">{score}</div>
                    <div className="text-xs text-muted-foreground mt-1">Acertos</div>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <div className="text-3xl font-bold">{percentage}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Aproveitamento</div>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Tempo</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setQuizState('idle')}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Jogar Novamente
                  </Button>
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setQuizState('idle')
                      setTimeout(() => {
                        document.getElementById('ranking')?.scrollIntoView({ behavior: 'smooth' })
                      }, 300)
                    }}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Ranking
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Review answers */}
            <div className="mt-8 space-y-3">
              <h4 className="text-lg font-semibold mb-4">Revisão das Respostas</h4>
              {localResults.map((result, idx) => {
                const question = questions.find(q => q.id === result.questionId)
                if (!question) return null
                return (
                  <motion.div
                    key={result.questionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`border-l-4 ${result.correct ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {result.correct ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-sm mb-1">{question.question}</p>
                            {!result.correct && (
                              <p className="text-xs text-emerald-600 mb-1">
                                Resposta correta: {question.options[result.correctIndex]}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">{result.explanation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return null
}
