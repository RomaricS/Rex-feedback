"use client"

import { useState, useEffect, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ChevronLeft, ChevronRight, Edit, Trash2, Download } from "lucide-react"
import { format } from "date-fns"
import {Link} from "../../../i18n/routing"
import { feedbackService, Feedback } from "@/lib/feedback-service"
import { exportService } from "@/lib/export-service"
import { useAuth } from "@/contexts/auth-context"
import { useSearch } from "@/contexts/search-context"
import { DocumentData, DocumentSnapshot } from "firebase/firestore"


const stepColors: Record<string, string> = {
  ITA: "bg-blue-100 text-blue-800",
  AOR: "bg-purple-100 text-purple-800",
  MIL: "bg-yellow-100 text-yellow-800",
  MEDICAL_PASSED: "bg-green-100 text-green-800",
  BIL: "bg-orange-100 text-orange-800",
  BIOMETRICS_PASSED: "bg-green-100 text-green-800",
  BACKGROUND_CHECK: "bg-gray-100 text-gray-800",
  PPR: "bg-green-100 text-green-800",
  COPR: "bg-emerald-100 text-emerald-800",
  ECOPR: "bg-emerald-100 text-emerald-800",
  LANDING: "bg-teal-100 text-teal-800",
}

function getCurrentStep(steps: Feedback['steps']): string {
  if (!steps.length) return "N/A"
  
  // Find the latest step with a completion date
  const completedSteps = steps.filter(step => step.completedAt)
  if (completedSteps.length === 0) return "N/A"
  
  // Sort by completion date and get the latest
  const latestStep = completedSteps.sort(
    (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  )[0]
  
  return latestStep.stepType
}

function calculateProcessingTime(feedback: Feedback): string {
  if (!feedback.steps.length) return "N/A"
  
  const itaStep = feedback.steps.find(step => step.stepType === "ITA" && step.completedAt)
  if (!itaStep) return "N/A"
  
  const latestStep = feedback.steps
    .filter(step => step.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]
  
  if (!latestStep) return "N/A"
  
  const diffTime = new Date(latestStep.completedAt!).getTime() - new Date(itaStep.completedAt!).getTime()
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30))
  
  return diffMonths > 0 ? `${diffMonths} months` : "Less than 1 month"
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FeedbackTableProps {}

export function FeedbackTable({}: FeedbackTableProps) {
  const { user } = useAuth()
  const { filters } = useSearch()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData, DocumentData>>()
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([])
  
  // Use ref to track the current filters to avoid infinite loops
  const filtersRef = useRef(filters)
  const loadingRef = useRef(false)

  // Update filters ref when props change
  useEffect(() => {
    filtersRef.current = filters
  }, [filters.program, filters.country, filters.status, filters.search])

  const loadFeedbacks = async (resetPage = false) => {
    if (loadingRef.current) return
    
    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)
      
      const currentPage = resetPage ? 1 : page
      const currentLastDoc = resetPage ? null : lastDoc
      
      const result = await feedbackService.getFeedbacks(
        {
          program: filtersRef.current.program,
          country: filtersRef.current.country,
          status: filtersRef.current.status
        }, 
        { 
          page: currentPage, 
          limit: 10,
          lastDoc: currentPage > 1 ? currentLastDoc || undefined : undefined
        }
      )
      
      // Apply client-side search filter if needed
      let filteredFeedbacks = result.feedbacks
      if (filtersRef.current.search) {
        const searchTerm = filtersRef.current.search.toLowerCase()
        filteredFeedbacks = result.feedbacks.filter(feedback => 
          feedback.title.toLowerCase().includes(searchTerm) ||
          feedback.program.toLowerCase().includes(searchTerm) ||
          (feedback.country && feedback.country.toLowerCase().includes(searchTerm))
        )
      }
      
      setFeedbacks(filteredFeedbacks)
      setHasMore(result.hasMore)
      setLastDoc(result.lastDoc || undefined)
      
      // Store user's own feedbacks for export
      if (user) {
        const userOwnFeedbacks = filteredFeedbacks.filter(f => f.userId === user.uid)
        setUserFeedbacks(userOwnFeedbacks)
      }
      
      if (resetPage) {
        setPage(1)
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error)
      setError('Failed to load feedbacks')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  // Load feedbacks when component mounts
  useEffect(() => {
    loadFeedbacks(true)
  }, [])

  // Reload when filters change
  useEffect(() => {
    loadFeedbacks(true)
  }, [filters.program, filters.country, filters.status, filters.search])

  // Load when page changes (but not on initial mount)
  useEffect(() => {
    if (page > 1) {
      loadFeedbacks(false)
    }
  }, [page])

  const handlePreviousPage = () => {
    if (page > 1 && !loadingRef.current) {
      setPage(prev => prev - 1)
      setLastDoc(undefined) // Reset lastDoc for previous page
    }
  }

  const handleNextPage = () => {
    if (hasMore && !loadingRef.current) {
      setPage(prev => prev + 1)
    }
  }

  const handleDelete = async (feedbackId: string, feedbackTitle: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${feedbackTitle}"? This action cannot be undone.`
    )
    
    if (!confirmDelete) return
    
    try {
      setDeletingId(feedbackId)
      await feedbackService.deleteFeedback(feedbackId)
      // Refresh the feedbacks list
      loadFeedbacks(true)
    } catch (error) {
      console.error("Error deleting feedback:", error)
      alert("Failed to delete feedback. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    if (!user) return
    exportService.exportToCSV(userFeedbacks)
  }

  const handleExportPDF = () => {
    if (!user) return
    exportService.exportToPDF(userFeedbacks)
  }

  return (
    <div className="premium-card hover-lift transition-smooth">
      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-primary/10 rounded-2xl">
              <span className="text-xl md:text-2xl">💬</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Community Feedbacks</h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium">Real experiences from the community</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            {user && userFeedbacks.length > 0 && (
              <div className="flex gap-2 order-2 sm:order-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  className="shadow-sm flex-1 sm:flex-none h-9 md:h-8"
                >
                  <Download className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="text-xs md:text-sm">CSV</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportPDF}
                  className="shadow-sm flex-1 sm:flex-none h-9 md:h-8"
                >
                  <Download className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="text-xs md:text-sm">PDF</span>
                </Button>
              </div>
            )}
            <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg order-1 sm:order-2 h-9 md:h-10">
              <Link href="/feedback/new">
                <span className="text-sm md:text-base">Add Your Feedback</span>
              </Link>
            </Button>
          </div>
        </div>
        <div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading feedbacks...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No feedbacks found
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((feedback) => {
                    const currentStep = getCurrentStep(feedback.steps)
                    const processingTime = calculateProcessingTime(feedback)
                    
                    return (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-medium">
                          {feedback.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{feedback.program}</Badge>
                        </TableCell>
                        <TableCell>{feedback.country || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={feedback.applicationType === 'inland' ? 'default' : 'secondary'}>
                            {feedback.applicationType === 'inland' ? 'Inland' : 
                             feedback.applicationType === 'outland' ? 'Outland' : 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={stepColors[currentStep] || "bg-gray-100 text-gray-800"}
                          >
                            {currentStep}
                          </Badge>
                        </TableCell>
                        <TableCell>{processingTime}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/feedback/${feedback.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {user && feedback.userId === user.uid && feedback.userId !== 'anonymous' && (
                              <>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/feedback/edit/${feedback.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDelete(feedback.id!, feedback.title)}
                                  disabled={deletingId === feedback.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {feedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No feedbacks found
                </div>
              ) : (
                feedbacks.map((feedback) => {
                  const currentStep = getCurrentStep(feedback.steps)
                  const processingTime = calculateProcessingTime(feedback)
                  
                  return (
                    <div key={feedback.id} className="stats-card hover-lift group">
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium text-sm leading-tight flex-1">
                            {feedback.title}
                          </h3>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                              <Link href={`/feedback/${feedback.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {user && feedback.userId === user.uid && feedback.userId !== 'anonymous' && (
                              <>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                  <Link href={`/feedback/edit/${feedback.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                  onClick={() => handleDelete(feedback.id!, feedback.title)}
                                  disabled={deletingId === feedback.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {feedback.program.length > 30 
                                ? feedback.program.substring(0, 30) + '...' 
                                : feedback.program
                              }
                            </Badge>
                            <Badge 
                              className={`text-xs ${stepColors[currentStep] || "bg-gray-100 text-gray-800"}`}
                            >
                              {currentStep}
                            </Badge>
                            {feedback.applicationType && (
                              <Badge 
                                variant={feedback.applicationType === 'inland' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {feedback.applicationType === 'inland' ? 'Inland' : 'Outland'}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Country:</span> {feedback.country || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Processing:</span> {processingTime}
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {feedbacks.length} results (Page {page})
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1 || loading}
                  onClick={handlePreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!hasMore || loading}
                  onClick={handleNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  )
}