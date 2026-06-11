'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Globe,
  Database,
  ShieldCheck,
  Sparkles,
  GitBranch,
} from 'lucide-react'

const technologies = [
  {
    name: 'Vercel',
    subtitle: 'Front & Back End',
    description: 'Plataforma de deploy com Next.js 16, Server Components, API Routes e edge functions. Performance máxima com SSR e ISR.',
    icon: Globe,
    color: 'text-gray-900',
    bgGradient: 'from-gray-100 to-white',
    borderColor: 'border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-700',
    features: ['Next.js 16', 'Server Components', 'API Routes', 'Edge Runtime'],
  },
  {
    name: 'IBGE',
    subtitle: 'Dados Reais',
    description: 'API pública do Instituto Brasileiro de Geografia e Estatística. Dados de população, PIB, indicadores sociais de todos os municípios brasileiros.',
    icon: Database,
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-white',
    borderColor: 'border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    features: ['População 2022', 'PIB 2021', '27 Estados', 'Dados Censo'],
  },
  {
    name: 'Supabase',
    subtitle: 'Autenticação',
    description: 'Plataforma open-source de backend-as-a-service. Autenticação completa com email/senha, OAuth, e gerenciamento de sessão seguro.',
    icon: ShieldCheck,
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-white',
    borderColor: 'border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    features: ['Email/Senha', 'OAuth', 'JWT Tokens', 'Row Level Security'],
  },
  {
    name: 'Z.ai',
    subtitle: 'Criação do Artefato',
    description: 'Plataforma de IA que gerou este site completo. Do design ao código, da arquitetura ao deploy — tudo criado automaticamente.',
    icon: Sparkles,
    color: 'text-violet-700',
    bgGradient: 'from-violet-50 to-white',
    borderColor: 'border-violet-200',
    badgeColor: 'bg-violet-100 text-violet-700',
    features: ['Code Generation', 'Image Generation', 'Full-Stack', 'IA Integrada'],
  },
  {
    name: 'GitHub',
    subtitle: 'Versionamento',
    description: 'Controle de versão distribuído. Código fonte hospedado com histórico completo, pull requests, CI/CD e colaboração em equipe.',
    icon: GitBranch,
    color: 'text-gray-900',
    bgGradient: 'from-gray-100 to-white',
    borderColor: 'border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-700',
    features: ['Git', 'Pull Requests', 'CI/CD', 'Colaboração'],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function TechStackSection() {
  return (
    <section id="tech" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stack de{' '}
            <span className="text-emerald-600">Tecnologias</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cinco tecnologias trabalhando juntas para criar uma aplicação completa,
            do dado ao deploy.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {technologies.map((tech) => (
            <motion.div key={tech.name} variants={itemVariants}>
              <Card className={`group relative overflow-hidden border ${tech.borderColor} hover:shadow-lg transition-all duration-300 h-full`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${tech.bgGradient} opacity-50`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tech.bgGradient} border ${tech.borderColor}`}>
                      <tech.icon className={`w-6 h-6 ${tech.color}`} />
                    </div>
                    <Badge variant="secondary" className={tech.badgeColor}>
                      {tech.subtitle}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tech.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tech.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold text-center mb-6">Fluxo da Aplicação</h3>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                {[
                  { name: 'Z.ai', emoji: '🤖' },
                  { name: 'GitHub', emoji: '📂' },
                  { name: 'Vercel', emoji: '▲' },
                  { name: 'Next.js', emoji: '⚛️' },
                  { name: 'IBGE API', emoji: '📊' },
                  { name: 'Supabase', emoji: '🔐' },
                ].map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                      <span>{item.emoji}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {i < 5 && (
                      <span className="text-muted-foreground hidden sm:block">→</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
