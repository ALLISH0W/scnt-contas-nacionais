'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen, Calculator, RefreshCw, Layers, PieChart, GitCompare
} from 'lucide-react'

const METHODOLOGY_STEPS = [
  {
    icon: Layers,
    step: '01',
    title: 'Coleta de Dados',
    description: 'O IBGE coleta dados de diversas fontes: pesquisas econômicas (PMS, PIM-PF, PMC), dados administrativos (Receita Federal, Bacen, Comex) e estimativas de especialistas.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Calculator,
    step: '02',
    title: 'Cálculo do PIB',
    description: 'O PIB é calculado sob a ótica da produção (valor adicionado por setor), da despesa (consumo + investimento + exportações - importações) e da renda (remuneração dos fatores).',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
  {
    icon: RefreshCw,
    step: '03',
    title: 'Ajuste Sazonal',
    description: 'Utiliza-se o método X-13 ARIMA para remover efeitos sazonais (ciclos agrícolas, feriados, dias úteis), permitindo comparar trimestres consecutivos de forma consistente.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: GitCompare,
    step: '04',
    title: 'Encadeamento',
    description: 'Os índices são encadeados com ano-base 1995 = 100, permitindo comparar períodos diferentes. A taxa de variação é calculada sobre o índice encadeado.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: PieChart,
    step: '05',
    title: 'Desagregação Setorial',
    description: 'O PIB é desagregado em Agropecuária, Indústria e Serviços, cada um com sub-setores. Na ótica da despesa: Consumo das Famílias, FBCF, Exportações e Importações.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: BookOpen,
    step: '06',
    title: 'Divulgação',
    description: 'Os resultados são divulgados em Communicados e Publicações completas. Há revisões retrospectivas à medida que dados mais precisos se tornam disponíveis.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

export function MethodologySection() {
  return (
    <section id="metodologia" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Metodologia
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Como funciona o <span className="text-emerald-600">SCNT</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            O Sistema de Contas Nacionais Trimestrais segue metodologia internacional padronizada
            pelo Sistema de Contas Nacionais da ONU (SCN 2008), adaptada à realidade brasileira.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {METHODOLOGY_STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                {/* Step number background */}
                <div className="absolute top-0 right-0 text-[120px] font-bold text-muted/5 leading-none select-none">
                  {step.step}
                </div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${step.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Passo {step.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Key concepts */}
        <motion.div {...fadeInUp} className="mt-16">
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-8">
              <h3 className="font-bold text-lg mb-6 text-center">Conceitos Fundamentais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-emerald-600 mb-1">PIB Nominal vs. Real</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O PIB nominal inclui o efeito dos preços, enquanto o PIB real (usado no SCNT) 
                    elimina a inflação, permitindo medir o crescimento real da produção.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-emerald-600 mb-1">Ajuste Sazonal</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Remove padrões repetitivos (safra agrícola, Natal, dias úteis) para que a 
                    comparação entre trimestres consecutivos reflita a tendência real.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-emerald-600 mb-1">Índice Encadeado</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evita o &quot;efeipo substituição&quot; mudando os pesos a cada ano, diferente do 
                    índice de Laspeyres com base fixa. Permite comparações mais precisas.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-emerald-600 mb-1">Variação Interanual</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Compara o trimestre com o mesmo trimestre do ano anterior (ex: T4 2024 vs T4 2023). 
                    Elimina o efeito sazonal naturalmente, sem necessidade de ajuste.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
