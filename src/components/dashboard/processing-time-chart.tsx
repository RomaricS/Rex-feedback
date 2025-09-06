"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { chartDataService, ProcessingTimeData } from "@/lib/chart-data-service"


export function ProcessingTimeChart() {
  const [data, setData] = useState<ProcessingTimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const processingData = await chartDataService.getProcessingTimeByProgram()
        setData(processingData)
      } catch (err) {
        console.error('Error loading processing time data:', err)
        setError('Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card className="glass-card shadow-canadian transition-smooth hover:shadow-maple">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-lg">
            <span className="text-lg">📈</span>
          </div>
          Average Processing Time by Program
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on community feedback data 🍁
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex items-center gap-2 text-muted-foreground pulse-gentle">
              <span className="text-2xl maple-spinner">🍁</span>
              <span>Loading chart data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-red-500 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              {error}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground flex items-center gap-2">
              <span className="text-xl">📄</span>
              No processing time data available
            </div>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="program" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}mo`}
              className="fill-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === "averageTime" ? `${value} months` : value,
                name === "averageTime" ? "Avg Time" : "Count"
              ]}
              labelFormatter={(label) => `Program: ${label}`}
            />
            <Bar 
              dataKey="averageTime" 
              className="fill-primary"
              radius={[4, 4, 0, 0]}
            />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}