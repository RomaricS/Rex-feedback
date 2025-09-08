"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeedbackTable } from "@/components/dashboard/feedback-table"
import { ProcessingTimeChart } from "@/components/dashboard/processing-time-chart"
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"

export default function DashboardPage() {
  return (
      <div className="space-y-6 md:space-y-8">
      {/* Stats Overview */}
      <div className="premium-card">
        <div className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 md:mb-6">Dashboard Overview</h3>
          <StatsCards />
        </div>
      </div>

      {/* Charts Section */}
      <div className="relative overflow-hidden">
        <div className="bg-canadian-gradient p-4 md:p-10 rounded-3xl premium-card shadow-premium transition-smooth">
          <div className="relative flex flex-col md:flex-row gap-4 md:gap-8 z-10">
            <div className="flex-1"><StatusDistributionChart /></div>
            <div className="flex-1"><ProcessingTimeChart /></div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div>
        <FeedbackTable />
      </div>
      </div>
  )
}