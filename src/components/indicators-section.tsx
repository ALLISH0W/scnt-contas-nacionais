'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp, TrendingDown, BarChart3, Clock, Globe, Users
} from 'lucide-react'

interface EconomicIndicator {
  icon: React.ElementType
  label: string
  value: string
  unit: string
  change: string
  positive: boolean
  description: string
}

const INDICATORS: EconomicIndicator[] = [
  {
    icon: BarChart3,
    label: 'PIB Trimestral',
    value: '112.23',
    unit: 'índice',
    change: '+0.60%',
    positive: true,
    description: 'Índice com ajuste sazonal (4º tri 2024)',
  },
  {
    icon: TrendingUp,
    label: 'Variação Interanual',
    value: '+2.81',
    unit: '%',
    change: 'vs. 4º tri 2023',
    positive: true,
    description: 'Crescimento contra mesmo trimestre do ano anterior',
  },
  {
    icon: Clock,
    label: 'Variação Trimestral',
    value: '+0.60',
    unit: '%',
    change: 'vs. 3º tri 2024',
    positive: true,
    description: 'Crescimento contra trimestre anterior',
  },
  {
    icon: TrendingDown,
    label: 'Impacto COVID-19',
    value: '-9.6',
    unit: '%',
    change: '2º tri 2020',
    positive: false,
    description: 'Maior queda trimestral da série histórica',
  },
  {
    icon: Globe,
    label: 'Recuperação',
    value: '+17.4',
    unit: '%',
    change: '3º tri 2020',
    positive: true,
    description: 'Maior crescimento trimestral (pós-pandemia)',
  },
  {
    icon: Users,
    label: 'Consumo Famílias',
    value: '113.12',
    unit: 'índice',
    change: '+0.69%',
    positive: true,
    description: 'Principal componente da despesa (4º tri 2024)',
  },
]

function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const numValue = parseFloat(value.replace('+', '').replace('-', ''))
    const hasPlus = value.startsWith('+')
    const hasMinus = value.startsWith('-')
    const startTime = Date.now()
    const durationMs = duration * 1000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = numValue * eased

      if (value.includes('.')) {
        const decimals = value.split('.')[1]?.length || 2
        const formatted = current.toFixed(decimals)
        setDisplay(`${hasMinus ? '-' : hasPlus ? '+' : ''}${formatted}`)
      } else {
        setDisplay(`${hasMinus ? '-' : hasPlus ? '+' : ''}${Math.round(current)}`)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  return <span ref={ref}>{display}</span>
}

export function IndicatorsSection() {
  return (
    <section id="indicadores" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Indicadores Chave
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Números da <span className="text-emerald-600">Economia Brasileira</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Principais indicadores do SCNT que revelam o momento econômico do país.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDICATORS.map((indicator, index) => (
            <motion.div
              key={indicator.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                      <indicator.icon className={`w-5 h-5 ${indicator.positive ? 'text-emerald-500' : 'text-red-500'}`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      indicator.positive
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {indicator.change}
                    </span>
                  </div>

                  <div className="mb-1">
                    <span className="text-3xl font-bold tracking-tight">
                      <AnimatedCounter value={indicator.value} />
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">{indicator.unit}</span>
                  </div>

                  <h4 className="font-medium text-sm mb-1">{indicator.label}</h4>
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Timeline highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-emerald-950/50 to-gray-950/50 border-emerald-500/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <div className="text-sm text-emerald-400 font-medium mb-1">Série Histórica</div>
                  <div className="text-2xl font-bold text-white">1996 — Presente</div>
                  <div className="text-xs text-gray-400 mt-1">Base: média 1995 = 100</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-sm text-emerald-400 font-medium mb-1">Frequência</div>
                  <div className="text-2xl font-bold text-white">Trimestral</div>
                  <div className="text-xs text-gray-400 mt-1">Divulgação: ~60 dias após o trimestre</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-sm text-emerald-400 font-medium mb-1">Ajuste Sazonal</div>
                  <div className="text-2xl font-bold text-white">X-13 ARIMA</div>
                  <div className="text-xs text-gray-400 mt-1">Metodologia do US Census Bureau</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
