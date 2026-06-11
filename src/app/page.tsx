'use client'

import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { AboutSection } from '@/components/about-section'
import { IndicatorsSection } from '@/components/indicators-section'
import { MethodologySection } from '@/components/methodology-section'
import { DashboardSection } from '@/components/dashboard-section'
import { LoginDialog } from '@/components/login-dialog'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LoginDialog />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <IndicatorsSection />
        <MethodologySection />
        <DashboardSection />
      </main>
      <Footer />
    </div>
  )
}
