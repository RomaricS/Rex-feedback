"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeedbackTable } from "@/components/dashboard/feedback-table"
import { ProcessingTimeChart } from "@/components/dashboard/processing-time-chart"
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"

export default function DashboardPage() {
  return (
      <div className="space-y-8">
      <div className="relative overflow-hidden">
        <div className="bg-canadian-gradient p-10 rounded-3xl premium-card shadow-premium transition-smooth">
          <div className="relative flex flex-col md:flex-row gap-8 z-10">
            <div className="flex-1"><StatusDistributionChart /></div>
            <div className="flex-1"><ProcessingTimeChart /></div>
          </div>
        </div>
      </div>

      {/* Main Content Layout - Feedback Priority */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content - Feedback (Priority) */}
        <div className="xl:col-span-3">
          <FeedbackTable />
        </div>

        {/* Sidebar - Stats & Charts */}
        <div className="xl:col-span-1 space-y-6">
          <div className="premium-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Dashboard Overview</h3>
              <StatsCards />
            </div>
          </div>
          
        </div>
      </div>
      </div>
  )
}