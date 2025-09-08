"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, MapPin, FileText, Trash2 } from "lucide-react"
import { format } from "date-fns"
import {Link} from "../../../../../i18n/routing"
import { feedbackService, Feedback } from "@/lib/feedback-service"
import { useAuth } from "@/contexts/auth-context"

const stepColors: Record<string, string> = {
  ITA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  AOR: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  MIL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  MEDICAL_PASSED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  BIL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  BIOMETRICS_PASSED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  BACKGROUND_CHECK: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  PPR: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  COPR: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  ECOPR: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  LANDING: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
}

export default function FeedbackDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const feedbackId = params.id as string

  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true)
        setError(null)
        const feedbackData = await feedbackService.getFeedbackById(feedbackId)
        
        if (!feedbackData) {
          setError("Feedback not found")
          return
        }

        setFeedback(feedbackData)
      } catch (err) {
        console.error("Error loading feedback:", err)
        setError("Failed to load feedback details")
      } finally {
        setLoading(false)
      }
    }

    if (feedbackId) {
      loadFeedback()
    }
  }, [feedbackId])

  const handleDelete = async () => {
    if (!feedback || !user || feedback.userId !== user.uid) return
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this feedback? This action cannot be undone."
    )
    
    if (!confirmDelete) return
    
    try {
      setDeleting(true)
      await feedbackService.deleteFeedback(feedback.id!)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting feedback:", error)
      alert("Failed to delete feedback. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const calculateProcessingTime = (feedback: Feedback): string => {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                Loading feedback details...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !feedback) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {error || "Feedback not found"}
              </p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const processingTime = calculateProcessingTime(feedback)
  const completedSteps = feedback.steps.filter(step => step.completedAt).length
  // Don't count LANDING as mandatory - it's optional for statistics
  const mandatorySteps = feedback.steps.filter(step => step.stepType !== 'LANDING')
  const totalSteps = mandatorySteps.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          {user && feedback.userId === user.uid && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={{
                  pathname: '/feedback/edit/[id]',
                  params: { id: feedback.id! }
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-xl md:text-2xl leading-tight">
                  {feedback.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(feedback.createdAt, "MMM d, yyyy")}
                  </div>
                  {feedback.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {feedback.country}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {processingTime} processing time
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1 whitespace-nowrap">
                {feedback.program}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completedSteps}</div>
                <div className="text-xs text-muted-foreground">Completed Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalSteps}</div>
                <div className="text-xs text-muted-foreground">Core Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{processingTime}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>

            <Separator />

            {/* Process Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Immigration Process Steps</h3>
              
              {feedback.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No process steps recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.steps
                    .sort((a, b) => {
                      // Sort by completion date, with uncompleted items at the end
                      if (!a.completedAt && !b.completedAt) return 0
                      if (!a.completedAt) return 1
                      if (!b.completedAt) return -1
                      return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
                    })
                    .map((step, index) => (
                      <Card key={index} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className={stepColors[step.stepType] || "bg-gray-100 text-gray-800"}>
                                  {step.stepType}
                                </Badge>
                                <span className="font-medium">{step.stepName}</span>
                              </div>
                              
                              {step.comment && (
                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                  {step.comment}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground text-right">
                              {step.completedAt ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(step.completedAt), "MMM d, yyyy")}
                                </div>
                              ) : (
                                <div className="text-orange-600 font-medium">
                                  Pending
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}