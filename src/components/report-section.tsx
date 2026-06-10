'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText, TrendingUp, Users, AlertTriangle, Lightbulb,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react'

interface SummaryInsights {
  totalPopulation: number
  totalGDP: number
  overallGDPPerCapita: number
  mostPopulousState: {
    stateSigla: string
    stateName: string
    value: number
  } | null
  leastPopulousState: {
    stateSigla: string
    stateName: string
    value: number
  } | null
  highestGDPState: {
    stateSigla: string
    stateName: string
    value: number
  } | null
  lowestGDPState: {
    stateSigla: string
    stateName: string
    value: number
  } | null
  top5GDPPerCapita: Array<{
    stateSigla: string
    stateName: string
    gdpPerCapita: number
  }>
  bottom5GDPPerCapita: Array<{
    stateSigla: string
    stateName: string
    gdpPerCapita: number
  }>
  populationConcentration: {
    top5States: Array<{ stateSigla: string; value: number }>
    top5Percentage: number
  }
  gdpConcentration: {
    top5States: Array<{ stateSigla: string; value: number }>
    top5Percentage: number
  }
  regionalInsights: string[]
}

function formatPop(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} milhões`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} mil`
  return value.toLocaleString('pt-BR')
}

function formatGDPPerCapita(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

export function ReportSection() {
  const [summary, setSummary] = useState<SummaryInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true)
        const res = await fetch('/api/ibge/summary')
        if (!res.ok) throw new Error('Erro ao buscar resumo dos dados')
        const data = await res.json()
        setSummary(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  return (
    <section id="report" className="py-24 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Relatório IBGE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Insights{' '}
            <span className="text-emerald-600">Interessantes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pontos mais relevantes descobertos nos dados do Censo 2022 e PIB 2021 do IBGE.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : summary ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'População Brasil',
                  value: formatPop(summary.totalPopulation),
                  icon: Users,
                  trend: null,
                },
                {
                  title: 'PIB Total',
                  value: formatGDPPerCapita(summary.totalGDP * 1000 / summary.totalPopulation),
                  subtitle: 'per capita',
                  icon: TrendingUp,
                  trend: null,
                },
                {
                  title: 'Mais Populoso',
                  value: summary.mostPopulousState?.stateSigla || '-',
                  subtitle: formatPop(summary.mostPopulousState?.value || 0),
                  icon: ArrowUpRight,
                  trend: 'up' as const,
                },
                {
                  title: 'Menos Populoso',
                  value: summary.leastPopulousState?.stateSigla || '-',
                  subtitle: formatPop(summary.leastPopulousState?.value || 0),
                  icon: ArrowDownRight,
                  trend: 'down' as const,
                },
              ].map((metric) => (
                <Card key={metric.title}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{metric.title}</span>
                      <metric.icon className={`w-4 h-4 ${
                        metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-orange-500' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    {metric.subtitle && (
                      <div className="text-xs text-muted-foreground mt-1">{metric.subtitle}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Concentration Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Concentração Populacional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Top 5 estados concentram</span>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {summary.populationConcentration.top5Percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${summary.populationConcentration.top5Percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {summary.populationConcentration.top5States.map((state, i) => (
                      <div key={state.stateSigla} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{state.stateSigla}</span>
                        <span className="text-sm text-muted-foreground">{formatPop(state.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Concentração de PIB
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Top 5 estados concentram</span>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {summary.gdpConcentration.top5Percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${summary.gdpConcentration.top5Percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {summary.gdpConcentration.top5States.map((state, i) => (
                      <div key={state.stateSigla} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{state.stateSigla}</span>
                        <span className="text-sm text-muted-foreground">
                          R$ {(state.value / 1_000_000).toFixed(1)} bi
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GDP Per Capita Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Desigualdade: PIB per capita por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> Top 5 (Maior PIB per capita)
                    </h4>
                    <div className="space-y-3">
                      {summary.top5GDPPerCapita.map((state, i) => (
                        <div key={state.stateSigla} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{state.stateSigla} — {state.stateName}</span>
                              <span className="text-sm font-semibold text-emerald-700">
                                {formatGDPPerCapita(state.gdpPerCapita)}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{
                                  width: `${(state.gdpPerCapita / summary.top5GDPPerCapita[0].gdpPerCapita) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-1">
                      <ArrowDownRight className="w-4 h-4" /> Bottom 5 (Menor PIB per capita)
                    </h4>
                    <div className="space-y-3">
                      {summary.bottom5GDPPerCapita.map((state, i) => (
                        <div key={state.stateSigla} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{state.stateSigla} — {state.stateName}</span>
                              <span className="text-sm font-semibold text-orange-700">
                                {formatGDPPerCapita(state.gdpPerCapita)}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                              <div
                                className="bg-orange-500 h-1.5 rounded-full"
                                style={{
                                  width: `${(state.gdpPerCapita / summary.top5GDPPerCapita[0].gdpPerCapita) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Insights Regionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.regionalInsights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <span className="text-emerald-600 font-bold text-sm">{i + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Methodology Note */}
            <Card className="border-dashed">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Metodologia</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Os dados de população são do Censo Demográfico 2022 (agregado 6579, variável 9324)
                      e os dados de PIB são de 2021 (agregado 5938, variável 37), ambos obtidos via API pública do IBGE.
                      O PIB per capita foi calculado dividindo o PIB de 2021 pela população de 2022, como proxy.
                      Este relatório foi gerado automaticamente pela análise dos dados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </section>
  )
}
