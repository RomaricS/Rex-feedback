"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeedbackTable } from "@/components/dashboard/feedback-table"
import { Filters } from "@/components/dashboard/filters"
import { ProcessingTimeChart } from "@/components/dashboard/processing-time-chart"
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"

export default function DashboardPage() {
  const [filters, setFilters] = useState({})
  const t = useTranslations('dashboard')

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="bg-canadian-gradient p-8 rounded-2xl glass-card shadow-maple">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-maple-gradient rounded-xl shadow-lg">
                <span className="text-2xl">🇨🇦</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-blue-600 dark:from-red-400 dark:via-red-300 dark:to-blue-400 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-gray-800/50">
                <p className="text-sm text-muted-foreground mb-1">{t('communityPowered')}</p>
                <p className="font-semibold text-foreground">{t('communityPoweredDesc')}</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-gray-800/50">
                <p className="text-sm text-muted-foreground mb-1">{t('dataDriven')}</p>
                <p className="font-semibold text-foreground">{t('dataDrivenDesc')}</p>
              </div>
            </div>
          </div>
          {/* Decorative maple leaves */}
          <div className="absolute top-4 right-4 text-4xl opacity-20 animate-pulse">
            🍁
          </div>
          <div className="absolute bottom-6 right-12 text-2xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}>
            🍁
          </div>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingTimeChart />
        <StatusDistributionChart />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Filters onFiltersChange={handleFiltersChange} />
        </div>
        <div className="lg:col-span-3 order-1 lg:order-2">
          <FeedbackTable filters={filters} />
        </div>
      </div>
    </div>
  )
}