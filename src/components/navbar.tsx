'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth-store'

const navLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Tecnologias', href: '#tech' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Relatório', href: '#report' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, setShowLoginDialog, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-lg">BrasilData</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.name || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowLoginDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <LogIn className="w-4 h-4 mr-1" />
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-border">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
                      <User className="w-4 h-4" />
                      <span>{user.name || user.email}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => { logout(); setMobileOpen(false) }}>
                      <LogOut className="w-4 h-4 mr-1" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => { setShowLoginDialog(true); setMobileOpen(false) }}>
                    <LogIn className="w-4 h-4 mr-1" />
                    Entrar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
