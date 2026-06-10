'use client'

import { Heart, ExternalLink, Github } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-lg text-white">BrasilData</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Apresentação interativa sobre dados do Brasil, criada com Z.ai como artefato inteligente.
              Dados reais do IBGE, autenticação Supabase, deploy na Vercel.
            </p>
          </div>

          {/* Technologies */}
          <div>
            <h3 className="font-semibold text-white mb-3">Tecnologias</h3>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Vercel + Next.js', href: 'https://vercel.com' },
                { name: 'IBGE API', href: 'https://servicodados.ibge.gov.br' },
                { name: 'Supabase', href: 'https://supabase.com' },
                { name: 'Z.ai', href: 'https://z.ai' },
                { name: 'GitHub', href: 'https://github.com' },
              ].map((tech) => (
                <li key={tech.name}>
                  <a
                    href={tech.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                  >
                    {tech.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="font-semibold text-white mb-3">Fontes de Dados</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Censo Demográfico 2022</li>
              <li className="text-gray-400">PIB Municipal 2021</li>
              <li className="text-gray-400">27 Unidades da Federação</li>
              <li className="text-gray-400">API Pública IBGE v3</li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Criado com <Heart className="w-4 h-4 text-emerald-500" /> por Z.ai · Artefato inteligente
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <span className="text-xs text-gray-600">
              © {new Date().getFullYear()} BrasilData
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
