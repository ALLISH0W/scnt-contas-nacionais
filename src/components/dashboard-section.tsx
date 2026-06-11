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
  LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'
import { BarChart3, TrendingUp, TrendingDown, Lock, LogIn, Activity } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

interface GDPData {
  quarter: string
  quarterCode: string
  value: number
}

interface SectorData {
  quarter: string
  quarterCode: string
  sectorCode: string
  sectorName: string
  value: number
}

interface ComponentData {
  quarter: string
  quarterCode: string
  componentCode: string
  componentName: string
  value: number
}

const SECTOR_COLORS: Record<string, string> = {
  'Agropecuária': '#10b981',
  'Indústria': '#f59e0b',
  'Serviços': '#6366f1',
  'PIB': '#ec4899',
}

function formatQuarter(q: string): string {
  // "1º trimestre 2025" -> "T1 2025"
  return q.replace('1º trimestre', 'T1').replace('2º trimestre', 'T2').replace('3º trimestre', 'T3').replace('4º trimestre', 'T4')
}

function calcGrowthRate(data: GDPData[]): number | null {
  if (data.length < 2) return null
  const sorted = [...data].sort((a, b) => a.quarterCode.localeCompare(b.quarterCode))
  const last = sorted[sorted.length - 1].value
  const prev = sorted[sorted.length - 2].value
  return ((last - prev) / prev) * 100
}

function calcYoYGrowth(data: GDPData[]): number | null {
  if (data.length < 5) return null
  const sorted = [...data].sort((a, b) => a.quarterCode.localeCompare(b.quarterCode))
  const last = sorted[sorted.length - 1]
  const yearAgoCode = String(Number(last.quarterCode.substring(0, 4)) - 1) + last.quarterCode.substring(4)
  const yearAgo = sorted.find(d => d.quarterCode === yearAgoCode)
  if (!yearAgo) return null
  return ((last.value - yearAgo.value) / yearAgo.value) * 100
}

export function DashboardSection() {
  const { isAuthenticated, setShowLoginDialog } = useAuthStore()
  const [gdpData, setGdpData] = useState<GDPData[]>([])
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [componentData, setComponentData] = useState<ComponentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    async function fetchData() {
      try {
        setLoading(true)
        const [gdpRes, sectorRes, compRes] = await Promise.all([
          fetch('/api/scnt/gdp'),
          fetch('/api/scnt/sectors'),
          fetch('/api/scnt/components'),
        ])
        if (!gdpRes.ok || !sectorRes.ok || !compRes.ok) throw new Error('Erro ao buscar dados do SCNT')
        const gdp = await gdpRes.json()
        const sectors = await sectorRes.json()
        const components = await compRes.json()
        setGdpData(gdp)
        setSectorData(sectors)
        setComponentData(components)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <section id="dashboard" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="max-w-md mx-auto py-16">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Dashboard Protegido</h2>
              <p className="text-muted-foreground mb-6">
                Faça login para acessar os dados do SCNT — Contas Nacionais Trimestrais do IBGE.
              </p>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowLoginDialog(true)}>
                <LogIn className="w-5 h-5 mr-2" />
                Entrar com Supabase
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // Prepare chart data
  const gdpChartData = [...gdpData]
    .sort((a, b) => a.quarterCode.localeCompare(b.quarterCode))
    .map(d => ({ ...d, quarterShort: formatQuarter(d.quarter) }))

  // Sector chart data - pivot by quarter
  const sectorQuarters = [...new Set(sectorData.map(d => d.quarterCode))].sort()
  const sectorChartData = sectorQuarters.map(qc => {
    const row: Record<string, string | number> = {
      quarter: formatQuarter(sectorData.find(d => d.quarterCode === qc)?.quarter || ''),
      quarterCode: qc,
    }
    sectorData.filter(d => d.quarterCode === qc).forEach(d => {
      row[d.sectorName] = d.value
    })
    return row
  })

  // Component chart data for the last 8 quarters
  const lastQuarters = sectorQuarters.slice(-8)
  const componentChartData = lastQuarters.map(qc => {
    const row: Record<string, string | number> = {
      quarter: formatQuarter(componentData.find(d => d.quarterCode === qc)?.quarter || ''),
    }
    componentData.filter(d => d.quarterCode === qc).forEach(d => {
      row[d.componentName] = d.value
    })
    return row
  })

  const qGrowth = calcGrowthRate(gdpData)
  const yoyGrowth = calcYoYGrowth(gdpData)
  const latestGDP = gdpChartData.length > 0 ? gdpChartData[gdpChartData.length - 1] : null

  return (
    <section id="dashboard" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
            <Activity className="w-4 h-4" />
            SCNT — Contas Nacionais Trimestrais
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Dashboard <span className="text-emerald-600">Econômico</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dados do PIB trimestral, setores econômicos e componentes da despesa — IBGE/SIDRA.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: 'PIB (último trimestre)',
                  value: latestGDP ? latestGDP.value.toFixed(2) : '-',
                  subtitle: latestGDP ? formatQuarter(latestGDP.quarter) : '',
                  icon: BarChart3,
                  color: 'text-emerald-500',
                },
                {
                  title: 'Variação Trimestral',
                  value: qGrowth !== null ? `${qGrowth >= 0 ? '+' : ''}${qGrowth.toFixed(2)}%` : '-',
                  subtitle: 'Contra trimestre anterior',
                  icon: qGrowth !== null && qGrowth >= 0 ? TrendingUp : TrendingDown,
                  color: qGrowth !== null && qGrowth >= 0 ? 'text-emerald-500' : 'text-red-500',
                },
                {
                  title: 'Variação Interanual',
                  value: yoyGrowth !== null ? `${yoyGrowth >= 0 ? '+' : ''}${yoyGrowth.toFixed(2)}%` : '-',
                  subtitle: 'Contra mesmo trimestre do ano anterior',
                  icon: yoyGrowth !== null && yoyGrowth >= 0 ? TrendingUp : TrendingDown,
                  color: yoyGrowth !== null && yoyGrowth >= 0 ? 'text-emerald-500' : 'text-red-500',
                },
                {
                  title: 'Base de Cálculo',
                  value: '1995',
                  subtitle: 'Índice encadeado com ajuste sazonal',
                  icon: Activity,
                  color: 'text-muted-foreground',
                },
              ].map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{stat.title}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.subtitle}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <Tabs defaultValue="gdp" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="gdp">PIB</TabsTrigger>
                <TabsTrigger value="sectors">Setores</TabsTrigger>
                <TabsTrigger value="components">Componentes</TabsTrigger>
              </TabsList>

              <TabsContent value="gdp">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PIB — Índice Trimestral com Ajuste Sazonal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={gdpChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gdpGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="quarterShort" fontSize={11} angle={-45} textAnchor="end" height={60} />
                          <YAxis fontSize={12} />
                          <Tooltip
                            formatter={(value: number) => [value.toFixed(2), 'Índice PIB']}
                            labelFormatter={(label) => `Trimestre: ${label}`}
                          />
                          <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#gdpGradient)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sectors">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PIB por Setor — Índice com Ajuste Sazonal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sectorChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="quarter" fontSize={11} angle={-45} textAnchor="end" height={60} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          {['Agropecuária', 'Indústria', 'Serviços', 'PIB'].map((sector) => (
                            <Line
                              key={sector}
                              type="monotone"
                              dataKey={sector}
                              stroke={SECTOR_COLORS[sector]}
                              strokeWidth={sector === 'PIB' ? 3 : 2}
                              dot={false}
                              strokeDasharray={sector === 'PIB' ? '5 5' : undefined}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="components">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Componentes da Despesa — Últimos 8 Trimestres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={componentChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="quarter" fontSize={11} angle={-45} textAnchor="end" height={60} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          {['Agropecuária', 'Indústria', 'Serviços', 'PIB'].map((comp) => (
                            <Bar key={comp} dataKey={comp} fill={SECTOR_COLORS[comp]} radius={[2, 2, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Source note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Fonte: IBGE — Sistema de Contas Nacionais Trimestrais (SCNT) · Tabela SIDRA 1621 · Índice encadeado com ajuste sazonal (Base: média 1995 = 100)
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
