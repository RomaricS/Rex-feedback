import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  Timestamp,
  DocumentSnapshot 
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { chartDataService } from "@/lib/chart-data-service"

export interface ProcessStep {
  stepType: string
  stepName: string
  completedAt?: Date | null
  comment?: string
}

export interface Feedback {
  id?: string
  title: string
  country?: string
  program: string
  userId: string
  steps: ProcessStep[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FeedbackFilters {
  search?: string
  program?: string
  country?: string
  status?: string
}

export interface PaginationOptions {
  page: number
  limit: number
  lastDoc?: DocumentSnapshot
}

class FeedbackService {
  private collectionName = 'feedbacks'

  async createFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...feedbackData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      })
      
      // Invalidate chart caches when new feedback is added
      chartDataService.invalidateChartCaches()
      
      return docRef.id
    } catch (error) {
      console.error('Error creating feedback:', error)
      throw new Error('Failed to create feedback')
    }
  }

  async getFeedbacks(
    filters: FeedbackFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ) {
    try {
      let q = query(
        collection(db, this.collectionName),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      )

      // Apply filters
      if (filters.program) {
        q = query(q, where("program", "==", filters.program))
      }

      if (filters.country) {
        q = query(q, where("country", "==", filters.country))
      }

      // Note: Search functionality would require more complex querying
      // For now, we'll filter on the client side

      // Apply pagination
      if (pagination.lastDoc) {
        q = query(q, startAfter(pagination.lastDoc))
      }
      
      q = query(q, limit(pagination.limit))

      const querySnapshot = await getDocs(q)
      const feedbacks: Feedback[] = []
      let lastDoc = null

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        feedbacks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          steps: data.steps?.map((step: any) => ({
            ...step,
            completedAt: step.completedAt?.toDate()
          })) || []
        } as Feedback)
        lastDoc = doc
      })

      return {
        feedbacks,
        lastDoc,
        hasMore: querySnapshot.docs.length === pagination.limit
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      throw new Error('Failed to fetch feedbacks')
    }
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          steps: data.steps?.map((step: any) => ({
            ...step,
            completedAt: step.completedAt?.toDate()
          })) || []
        } as Feedback
      }

      return null
    } catch (error) {
      console.error('Error fetching feedback:', error)
      throw new Error('Failed to fetch feedback')
    }
  }

  async updateFeedback(id: string, updates: Partial<Feedback>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      }

      // Convert Date objects to Timestamps for steps
      if (updates.steps) {
        updateData.steps = updates.steps.map(step => ({
          ...step,
          completedAt: step.completedAt ? Timestamp.fromDate(step.completedAt) : null
        }))
      }

      await updateDoc(docRef, updateData)
      
      // Invalidate chart caches when feedback is updated
      chartDataService.invalidateChartCaches()
    } catch (error) {
      console.error('Error updating feedback:', error)
      throw new Error('Failed to update feedback')
    }
  }

  async deleteFeedback(id: string): Promise<void> {
    try {
      // Soft delete by setting isActive to false
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.fromDate(new Date())
      })
      
      // Invalidate chart caches when feedback is deleted
      chartDataService.invalidateChartCaches()
    } catch (error) {
      console.error('Error deleting feedback:', error)
      throw new Error('Failed to delete feedback')
    }
  }

  async getUserActiveFeedback(userId: string): Promise<Feedback | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        where("isActive", "==", true),
        limit(1)
      )

      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      const data = doc.data()
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        steps: data.steps?.map((step: any) => ({
          ...step,
          completedAt: step.completedAt?.toDate()
        })) || []
      } as Feedback
    } catch (error) {
      console.error('Error fetching user feedback:', error)
      throw new Error('Failed to fetch user feedback')
    }
  }
}

export const feedbackService = new FeedbackService()