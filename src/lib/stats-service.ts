/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer,
  Timestamp 
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Stats {
  totalFeedbacks: number
  thisMonthFeedbacks: number
  feedbackGrowth: number
  averageProcessingTime: {
    months: number
    days: number
  }
  successRate: number
}

class StatsService {
  private collectionName = 'feedbacks'

  async getStats(): Promise<Stats> {
    try {
      // Get total feedbacks
      const totalQuery = query(
        collection(db, this.collectionName),
        where("isActive", "==", true)
      )
      const totalSnapshot = await getCountFromServer(totalQuery)
      const totalFeedbacks = totalSnapshot.data().count

      // Get feedbacks from this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const thisMonthQuery = query(
        collection(db, this.collectionName),
        where("isActive", "==", true),
        where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
      )
      const thisMonthSnapshot = await getCountFromServer(thisMonthQuery)
      const thisMonthFeedbacks = thisMonthSnapshot.data().count

      // Get feedbacks from last month for comparison
      const startOfLastMonth = new Date(startOfMonth)
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
      const endOfLastMonth = new Date(startOfMonth)
      endOfLastMonth.setTime(endOfLastMonth.getTime() - 1)

      const lastMonthQuery = query(
        collection(db, this.collectionName),
        where("isActive", "==", true),
        where("createdAt", ">=", Timestamp.fromDate(startOfLastMonth)),
        where("createdAt", "<=", Timestamp.fromDate(endOfLastMonth))
      )
      const lastMonthSnapshot = await getCountFromServer(lastMonthQuery)
      const lastMonthFeedbacks = lastMonthSnapshot.data().count

      // Get successful feedbacks (with completion steps)
      const successfulQuery = query(
        collection(db, this.collectionName),
        where("isActive", "==", true)
      )
      const successfulSnapshot = await getDocs(successfulQuery)
      
      let successfulCount = 0
      let totalProcessingDays = 0
      let validProcessingTimes = 0

      successfulSnapshot.forEach((doc) => {
        const data = doc.data()
        const steps = data.steps || []
        
        // Check if has completion steps
        const hasCompletionStep = steps.some((step: any) => 
          ['COPR', 'ECOPR', 'LANDING'].includes(step.stepType) && step.completedAt
        )
        
        if (hasCompletionStep) {
          successfulCount++
          
          // Calculate processing time if possible
          const itaStep = steps.find((step: any) => 
            step.stepType === 'ITA' && step.completedAt
          )
          
          if (itaStep) {
            const completionSteps = steps
              .filter((step: any) => 
                ['COPR', 'ECOPR', 'LANDING'].includes(step.stepType) && step.completedAt
              )
              .sort((a: any, b: any) => 
                b.completedAt.toDate().getTime() - a.completedAt.toDate().getTime()
              )
            
            if (completionSteps.length > 0) {
              const latestStep = completionSteps[0]
              const processingTime = latestStep.completedAt.toDate().getTime() - 
                                   itaStep.completedAt.toDate().getTime()
              totalProcessingDays += processingTime / (1000 * 60 * 60 * 24)
              validProcessingTimes++
            }
          }
        }
      })

      // Calculate metrics
      const averageProcessingDays = validProcessingTimes > 0 
        ? totalProcessingDays / validProcessingTimes 
        : 0
      const averageProcessingMonths = averageProcessingDays / 30

      const feedbackGrowth = lastMonthFeedbacks > 0 
        ? ((thisMonthFeedbacks - lastMonthFeedbacks) / lastMonthFeedbacks) * 100 
        : 0

      const successRate = totalFeedbacks > 0 
        ? (successfulCount / totalFeedbacks) * 100 
        : 0

      return {
        totalFeedbacks,
        thisMonthFeedbacks,
        feedbackGrowth: Math.round(feedbackGrowth * 10) / 10,
        averageProcessingTime: {
          months: Math.round(averageProcessingMonths * 10) / 10,
          days: Math.round(averageProcessingDays),
        },
        successRate: Math.round(successRate * 10) / 10,
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      throw new Error('Failed to fetch statistics')
    }
  }
}

export const statsService = new StatsService()