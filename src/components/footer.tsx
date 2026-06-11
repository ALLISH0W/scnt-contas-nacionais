'use client'

import { Heart, ExternalLink } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="font-bold text-lg text-white">SCNT Data</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Sistema de Contas Nacionais Trimestrais — visualização interativa dos dados do IBGE.
              PIB, setores econômicos e componentes da despesa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-3">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'IBGE — SCNT', href: 'https://www.ibge.gov.br/estatisticas/economicas/comercio/9300-contas-nacionais-trimestrais.html' },
                { name: 'SIDRA — Tabela 1621', href: 'https://sidra.ibge.gov.br/tabela/1621' },
                { name: 'Supabase', href: 'https://supabase.com' },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Criado com <Heart className="w-4 h-4 text-emerald-500" /> por Z.ai
          </p>
          <span className="text-xs text-gray-600">
            © {new Date().getFullYear()} SCNT Data · Dados: IBGE/SIDRA
          </span>
        </div>
      </div>
    </footer>
  )
}
