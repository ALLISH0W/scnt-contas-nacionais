'use client'

import { motion } from 'framer-motion'
import { ArrowDown, BarChart3, Database, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth-store'

export function HeroSection() {
  const { isAuthenticated, setShowLoginDialog } = useAuthStore()

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-gray-950 to-gray-900" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      {/* Hero image overlay */}
      <div className="absolute inset-0 opacity-15">
        <img
          src="/hero-image.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Criado com Z.ai — O artefato inteligente
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Dados do Brasil
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
            em tempo real
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
        >
          Explore dados reais do IBGE com dashboard interativo, autenticação via Supabase,
          e relatórios com insights — tudo rodando na Vercel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#dashboard">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base">
              <BarChart3 className="w-5 h-5 mr-2" />
              Explorar Dashboard
            </Button>
          </a>
          <a href="#tech">
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/5 px-8 h-12 text-base">
              <Database className="w-5 h-5 mr-2" />
              Ver Tecnologias
            </Button>
          </a>
          {!isAuthenticated && (
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-600 text-emerald-400 hover:bg-emerald-500/10 px-8 h-12 text-base"
              onClick={() => setShowLoginDialog(true)}
            >
              Fazer Login
            </Button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { label: 'Fonte de Dados', value: 'IBGE' },
            { label: 'Autenticação', value: 'Supabase' },
            { label: 'Deploy', value: 'Vercel' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-6 h-6 text-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  )
}
