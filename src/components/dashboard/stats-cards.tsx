"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { statsService, Stats } from "@/lib/stats-service"


export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Feedbacks",
      value: stats?.totalFeedbacks.toLocaleString() || "0",
      icon: Users,
      change: `${stats?.feedbackGrowth > 0 ? "+" : ""}${stats?.feedbackGrowth.toFixed(1)}%`,
      changeType: (stats?.feedbackGrowth || 0) >= 0 ? "positive" : "negative",
    },
    {
      title: "Average Processing Time",
      value: `${stats?.averageProcessingTime.months.toFixed(1) || "0"} months`,
      icon: Clock,
      change: "Based on completed cases",
      changeType: "neutral",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate.toFixed(1) || "0"}%`,
      icon: CheckCircle,
      change: "COPR/eCOPR received",
      changeType: "positive",
    },
    {
      title: "This Month",
      value: stats?.thisMonthFeedbacks.toLocaleString() || "0",
      icon: TrendingUp,
      change: `${stats?.feedbackGrowth > 0 ? "+" : ""}${stats?.feedbackGrowth.toFixed(1)}%`,
      changeType: (stats?.feedbackGrowth || 0) >= 0 ? "positive" : "negative",
    },
  ]

  return (
    <div className="grid gap-4">
      {statsData.map((stat, index) => (
        <div key={index} className="stats-card hover-lift transition-smooth group cursor-pointer">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide group-hover:text-foreground transition-colors">
                {stat.title}
              </h3>
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <p className="text-sm font-medium">
                <span className={
                  stat.changeType === "positive" ? "text-emerald-600 dark:text-emerald-400" : 
                  stat.changeType === "negative" ? "text-red-600 dark:text-red-400" : 
                  "text-muted-foreground"
                }>
                  {stat.change}
                </span>
                {stat.changeType !== "neutral" && (
                  <span className="text-muted-foreground ml-1">from last month</span>
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}