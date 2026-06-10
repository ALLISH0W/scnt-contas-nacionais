'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { BarChart3, Users, TrendingUp, Lock, LogIn } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

interface PopulationData {
  stateId: string
  stateName: string
  stateSigla: string
  value: number
}

interface PIBData {
  stateId: string
  stateName: string
  stateSigla: string
  value: number
}

const CHART_COLORS = [
  '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5',
  '#059669', '#047857', '#065f46', '#064e3b', '#022c22',
  '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1',
  '#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e',
  '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7',
  '#d97706', '#b45309',
]

function formatPopulation(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toString()
}

function formatGDP(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)} bi`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)} mi`
  return `R$ ${value}`
}

export function DashboardSection() {
  const { isAuthenticated, setShowLoginDialog } = useAuthStore()
  const [population, setPopulation] = useState<PopulationData[]>([])
  const [pib, setPIB] = useState<PIBData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [popRes, pibRes] = await Promise.all([
          fetch('/api/ibge/population'),
          fetch('/api/ibge/pib'),
        ])
        
        if (!popRes.ok || !pibRes.ok) {
          throw new Error('Erro ao buscar dados do IBGE')
        }

        const popData = await popRes.json()
        const pibData = await pibRes.json()

        setPopulation(popData)
        setPIB(pibData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Top 10 for charts
  const top10Pop = population.slice(0, 10)
  const top10PIB = pib.slice(0, 10)

  // Population by region for pie chart
  const REGIONS: Record<string, string[]> = {
    'Norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
    'Sul': ['PR', 'RS', 'SC'],
    'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
  }

  const regionData = Object.entries(REGIONS).map(([name, siglas]) => ({
    name,
    value: population
      .filter((p) => siglas.includes(p.stateSigla))
      .reduce((sum, p) => sum + p.value, 0),
  }))

  if (!isAuthenticated) {
    return (
      <section id="dashboard" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="max-w-md mx-auto py-16">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Dashboard Protegido</h2>
              <p className="text-muted-foreground mb-6">
                Faça login com Supabase para acessar os dados do IBGE com gráficos interativos.
              </p>
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowLoginDialog(true)}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Entrar com Supabase
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="dashboard" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Dados do IBGE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Dashboard{' '}
            <span className="text-emerald-600">Interativo</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dados reais do Censo 2022 e PIB 2021, atualizados via API do IBGE.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: 'População Total',
                  value: formatPopulation(population.reduce((s, p) => s + p.value, 0)),
                  icon: Users,
                  subtitle: 'Censo 2022',
                },
                {
                  title: 'Mais Populoso',
                  value: population[0]?.stateSigla || '-',
                  icon: Users,
                  subtitle: formatPopulation(population[0]?.value || 0),
                },
                {
                  title: 'Maior PIB',
                  value: pib[0]?.stateSigla || '-',
                  icon: TrendingUp,
                  subtitle: formatGDP(pib[0]?.value || 0),
                },
                {
                  title: 'Unidades',
                  value: '27',
                  icon: BarChart3,
                  subtitle: 'Estados + DF',
                },
              ].map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{stat.title}</span>
                      <stat.icon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.subtitle}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <Tabs defaultValue="population" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="population">População</TabsTrigger>
                <TabsTrigger value="pib">PIB</TabsTrigger>
                <TabsTrigger value="regions">Regiões</TabsTrigger>
              </TabsList>

              <TabsContent value="population">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Top 10 Estados por População</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={top10Pop} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tickFormatter={formatPopulation} fontSize={12} />
                            <YAxis dataKey="stateSigla" type="category" fontSize={12} width={35} />
                            <Tooltip
                              formatter={(value: number) => [formatPopulation(value), 'População']}
                              labelFormatter={(label) => `Estado: ${label}`}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                              {top10Pop.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ranking Completo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {population.map((state, i) => (
                          <div key={state.stateId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i < 3 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{state.stateSigla}</div>
                              <div className="text-xs text-muted-foreground truncate">{state.stateName}</div>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {formatPopulation(state.value)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="pib">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Top 10 Estados por PIB (2021)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={top10PIB} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tickFormatter={(v) => formatGDP(v)} fontSize={12} />
                            <YAxis dataKey="stateSigla" type="category" fontSize={12} width={35} />
                            <Tooltip
                              formatter={(value: number) => [formatGDP(value), 'PIB']}
                              labelFormatter={(label) => `Estado: ${label}`}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                              {top10PIB.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ranking PIB</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {pib.map((state, i) => (
                          <div key={state.stateId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i < 3 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{state.stateSigla}</div>
                              <div className="text-xs text-muted-foreground truncate">{state.stateName}</div>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {formatGDP(state.value)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="regions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">População por Região</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={regionData}
                            cx="50%"
                            cy="50%"
                            outerRadius={160}
                            innerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {regionData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [formatPopulation(value), 'População']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </section>
  )
}
