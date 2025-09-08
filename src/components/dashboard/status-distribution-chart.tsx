"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { chartDataService, StatusDistributionData } from "@/lib/chart-data-service"

// Define colors for different statuses with better dark mode support
const statusColors = [
  "hsl(221, 70%, 60%)", // Blue
  "hsl(262, 70%, 65%)", // Purple
  "hsl(48, 85%, 60%)",  // Yellow
  "hsl(25, 85%, 60%)",  // Orange
  "hsl(142, 60%, 50%)", // Green
  "hsl(173, 50%, 50%)", // Teal
  "hsl(0, 70%, 65%)",   // Red
  "hsl(291, 55%, 55%)", // Pink
  "hsl(204, 75%, 60%)", // Sky Blue
  "hsl(42, 75%, 60%)",  // Gold
]

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function StatusDistributionChart() {
  const [data, setData] = useState<StatusDistributionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const statusData = await chartDataService.getStatusDistribution()
        setData(statusData)
      } catch (err) {
        console.error('Error loading status distribution data:', err)
        setError('Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Transform data for the chart
  const chartData = data.map((item, index) => ({
    name: item.status,
    value: item.percentage,
    count: item.count,
    color: statusColors[index % statusColors.length]
  }))

  return (
    <Card className="glass-card shadow-canadian transition-smooth hover:shadow-maple">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-400/20 dark:to-blue-400/20 rounded-lg">
            <span className="text-lg">🗺</span>
          </div>
          Current Status Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Where community members are in their journey 🍁
        </p>
      </CardHeader>
      <CardContent>
        {(() => {
          if (loading) {
            return (
              <div className="flex items-center justify-center h-[300px]">
                <div className="flex items-center gap-2 text-muted-foreground pulse-gentle">
                  <span className="text-2xl maple-spinner">🍁</span>
                  <span>Loading chart data...</span>
                </div>
              </div>
            );
          }

          if (error) {
            return (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-red-500 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  {error}
                </div>
              </div>
            );
          }

          if (chartData.length === 0) {
            return (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-muted-foreground flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  No status distribution data available
                </div>
              </div>
            );
          }

          return (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: { payload: { count: number } }) => [
                    `${value}% (${props.payload.count} people)`, 
                    "Percentage"
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span style={{ fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  )
}