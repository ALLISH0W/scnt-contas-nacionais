'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  BarChart3, TrendingUp, Scale, Factory, Wheat, Truck,
  ArrowRightLeft, FileText, Database
} from 'lucide-react'

const SCNT_HIGHLIGHTS = [
  {
    icon: BarChart3,
    title: 'PIB Trimestral',
    description: 'Mede o valor adicionado bruto da economia brasileira a cada trimestre, com ajuste sazonal e dessazonalizado.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Wheat,
    title: 'Agropecuária',
    description: 'Acompanha a produção agrícola e pecuária, setor estratégico com forte impacto no comércio exterior.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Factory,
    title: 'Indústria',
    description: 'Monitora a atividade industrial incluindo transformação, construção civil e utilities.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Truck,
    title: 'Serviços',
    description: 'Maior setor da economia, abrange comércio, transporte, informação, financeiro e serviços pessoais.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: ArrowRightLeft,
    title: 'Comércio Exterior',
    description: 'Exportações e importações de bens e serviços, balança comercial e taxa de câmbio real.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Scale,
    title: 'Consumo e Investimento',
    description: 'Despesa das famílias, formação bruta de capital fixo e variação de estoques — motores do crescimento.',
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

export function AboutSection() {
  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Sobre o SCNT
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            O que são as <span className="text-emerald-600">Contas Nacionais Trimestrais</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            O Sistema de Contas Nacionais Trimestrais (SCNT) é uma estatística produzida pelo IBGE que
            permite acompanhar a evolução da economia brasileira em intervalos curtos, possibilitando
            a análise conjuntural e a formulação de políticas públicas.
          </p>
        </motion.div>

        {/* Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.div {...fadeInUp}>
            <Card className="h-full border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">O que mede?</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      O SCNT mede o Produto Interno Bruto (PIB) brasileiro sob três óticas: 
                      <strong> produção</strong> (valor adicionado por setor), 
                      <strong> despesa</strong> (consumo, investimento, exportações líquidas) e 
                      <strong> renda</strong> (remuneração dos fatores de produção). 
                      Os dados são divulgados a cada trimestre com ajuste sazonal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card className="h-full border-l-4 border-l-teal-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Por que é importante?</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      É o principal indicador de atividade econômica do país. Permite detectar 
                      recessões, ciclos econômicos e tendências de crescimento em tempo real. 
                      Serve de base para decisões de <strong>política monetária</strong> (Bacen), 
                      <strong> política fiscal</strong> (Tesouro) e <strong>previsões de mercado</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sector Cards */}
        <motion.div {...fadeInUp} className="mb-8">
          <h3 className="text-2xl font-bold text-center mb-2">
            Componentes do SCNT
          </h3>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            O sistema abrange todos os setores e componentes da atividade econômica, permitindo uma visão completa da economia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCNT_HIGHLIGHTS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
                <CardContent className="p-6">
                  <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Reference */}
        <motion.div {...fadeInUp} className="mt-12 text-center">
          <a
            href="https://www.ibge.gov.br/estatisticas/economicas/comercio/9300-contas-nacionais-trimestrais.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Acesse a página oficial do SCNT no IBGE
          </a>
        </motion.div>
      </div>
    </section>
  )
}
