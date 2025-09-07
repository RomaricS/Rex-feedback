/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  collection, 
  query, 
  where, 
  getDocs,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cacheService } from "@/lib/cache-service"
import { Feedback } from "@/lib/feedback-service"

export interface ProcessingTimeData {
  program: string
  averageTime: number // in months
  count: number
}

export interface StatusDistributionData {
  status: string
  count: number
  percentage: number
}

class ChartDataService {
  private collectionName = 'feedbacks'

  async getProcessingTimeByProgram(): Promise<ProcessingTimeData[]> {
    return cacheService.cached(
      'processing-time-by-program',
      async () => {
        try {
          const q = query(
            collection(db, this.collectionName),
            where("isActive", "==", true)
          )
          
          const querySnapshot = await getDocs(q)
          const programData = new Map<string, { totalDays: number, count: number }>()

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            const feedback = {
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              steps: data.steps?.map((step: any) => ({
                ...step,
                completedAt: step.completedAt?.toDate()
              })) || []
            } as Feedback

            // Calculate processing time if ITA and completion steps exist
            const itaStep = feedback.steps.find(step => 
              step.stepType === 'ITA' && step.completedAt
            )

            if (itaStep) {
              const completionSteps = feedback.steps
                .filter(step => 
                  ['COPR', 'ECOPR', 'LANDING'].includes(step.stepType) && step.completedAt
                )
                .sort((a, b) => 
                  new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
                )

              if (completionSteps.length > 0) {
                const latestStep = completionSteps[0]
                const processingDays = (
                  new Date(latestStep.completedAt!).getTime() - 
                  new Date(itaStep.completedAt!).getTime()
                ) / (1000 * 60 * 60 * 24)

                const program = feedback.program
                if (!programData.has(program)) {
                  programData.set(program, { totalDays: 0, count: 0 })
                }
                const existing = programData.get(program)!
                existing.totalDays += processingDays
                existing.count += 1
              }
            }
          })

          // Convert to chart format
          const result: ProcessingTimeData[] = []
          programData.forEach((data, program) => {
            if (data.count > 0) {
              result.push({
                program: program.length > 25 ? program.substring(0, 25) + '...' : program,
                averageTime: Math.round((data.totalDays / data.count / 30) * 10) / 10, // Convert to months
                count: data.count
              })
            }
          })

          // Sort by count descending and take top 8 programs
          return result
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)

        } catch (error) {
          console.error('Error fetching processing time data:', error)
          return []
        }
      },
      cacheService.getChartTTL()
    )
  }

  async getStatusDistribution(): Promise<StatusDistributionData[]> {
    return cacheService.cached(
      'status-distribution',
      async () => {
        try {
          const q = query(
            collection(db, this.collectionName),
            where("isActive", "==", true)
          )
          
          const querySnapshot = await getDocs(q)
          const statusCounts = new Map<string, number>()
          let totalFeedbacks = 0

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            const steps = data.steps || []
            totalFeedbacks++

            // Get the latest completed step
            const completedSteps = steps
              .filter((step: any) => step.completedAt)
              .sort((a: any, b: any) => 
                b.completedAt.toDate().getTime() - a.completedAt.toDate().getTime()
              )

            if (completedSteps.length > 0) {
              const latestStep = completedSteps[0]
              const stepType = latestStep.stepType
              statusCounts.set(stepType, (statusCounts.get(stepType) || 0) + 1)
            } else {
              // No completed steps yet
              statusCounts.set('Not Started', (statusCounts.get('Not Started') || 0) + 1)
            }
          })

          // Convert to chart format with percentages
          const result: StatusDistributionData[] = []
          statusCounts.forEach((count, status) => {
            const percentage = Math.round((count / totalFeedbacks) * 100)
            if (percentage > 0) { // Only include statuses with at least 1%
              result.push({
                status: this.formatStatusName(status),
                count,
                percentage
              })
            }
          })

          // Sort by count descending
          return result.sort((a, b) => b.count - a.count)

        } catch (error) {
          console.error('Error fetching status distribution:', error)
          return []
        }
      },
      cacheService.getChartTTL()
    )
  }

  private formatStatusName(status: string): string {
    const statusMap: Record<string, string> = {
      'ITA': 'ITA Received',
      'AOR': 'AOR Received',
      'MIL': 'Medical Instruction',
      'MEDICAL_PASSED': 'Medical Passed',
      'BIL': 'Biometric Instruction',
      'BIOMETRICS_PASSED': 'Biometrics Passed',
      'BACKGROUND_CHECK': 'Background Check',
      'PPR': 'PPR Received',
      'COPR': 'COPR Received',
      'ECOPR': 'eCOPR Received',
      'LANDING': 'Landed',
      'Not Started': 'Not Started'
    }
    
    return statusMap[status] || status
  }

  // Method to invalidate chart caches (call after new feedback is added)
  invalidateChartCaches(): void {
    cacheService.invalidate('processing-time-by-program')
    cacheService.invalidate('status-distribution')
  }
}

export const chartDataService = new ChartDataService()