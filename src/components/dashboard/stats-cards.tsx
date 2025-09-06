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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="glass-card shadow-canadian transition-smooth hover:shadow-maple group cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-red-500/10 to-blue-500/10 dark:from-red-400/20 dark:to-blue-400/20 rounded-lg group-hover:from-red-500/20 group-hover:to-blue-500/20 transition-all">
              <stat.icon className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 dark:from-red-400 dark:to-blue-400 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={
                stat.changeType === "positive" ? "text-green-600 dark:text-green-400" : 
                stat.changeType === "negative" ? "text-red-600 dark:text-red-400" : 
                "text-muted-foreground"
              }>
                {stat.change}
              </span>
              {stat.changeType !== "neutral" && " from last month"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}