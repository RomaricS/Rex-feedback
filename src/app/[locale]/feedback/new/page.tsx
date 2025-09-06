"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { feedbackService } from "@/lib/feedback-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

const programs = [
  "Express Entry - General",
  "Express Entry - CEC (Canadian Experience Class)",
  "Express Entry - FSW (Federal Skilled Worker)",
  "Express Entry - PNP (Provincial Nominee Program)",
  "Express Entry - French Proficiency",
  "Express Entry - STEM Occupations",
  "Express Entry - Healthcare Occupations",
  "Express Entry - Trade Occupations",
  "Provincial Nominee Program - General",
  "Provincial Nominee Program - Tech",
  "Provincial Nominee Program - Healthcare",
  "Provincial Nominee Program - Trades",
  "Quebec Skilled Worker Program",
  "Quebec Experience Program",
  "Family Sponsorship - Spouse/Partner",
  "Family Sponsorship - Parent/Grandparent",
  "Family Sponsorship - Child",
  "Start-up Visa Program",
  "Self-employed Persons Program",
  "Investor Program",
  "Caregiver Program",
  "Rural and Northern Immigration Pilot",
  "Atlantic Immigration Program",
  "Municipal Nominee Program",
  "Agri-Food Pilot",
]

const stepOptions = [
  { value: "ITA", label: "Invitation to Apply (ITA)" },
  { value: "AOR", label: "Acknowledgment of Receipt (AOR)" },
  { value: "MIL", label: "Medical Instruction Letter (MIL)" },
  { value: "MEDICAL_PASSED", label: "Medical Passed" },
  { value: "BIL", label: "Biometric Instruction Letter (BIL)" },
  { value: "BIOMETRICS_PASSED", label: "Biometrics Passed" },
  { value: "BACKGROUND_CHECK", label: "Background Check" },
  { value: "PPR", label: "Passport Request (PPR)" },
  { value: "COPR", label: "Confirmation of Permanent Residence (COPR)" },
  { value: "ECOPR", label: "Electronic COPR (eCOPR)" },
  { value: "LANDING", label: "Landing/First Entry" },
]

interface ProcessStep {
  stepType: string
  stepName: string
  completedAt?: string
  comment?: string
}

export default function NewFeedbackPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    country: "",
    program: "",
  })
  
  const [steps, setSteps] = useState<ProcessStep[]>([
    { stepType: "", stepName: "", completedAt: "", comment: "" }
  ])

  const addStep = () => {
    setSteps([...steps, { stepType: "", stepName: "", completedAt: "", comment: "" }])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, field: keyof ProcessStep, value: string) => {
    const updatedSteps = steps.map((step, i) => {
      if (i === index) {
        const updatedStep = { ...step, [field]: value }
        if (field === "stepType") {
          const stepOption = stepOptions.find(opt => opt.value === value)
          updatedStep.stepName = stepOption?.label || ""
        }
        return updatedStep
      }
      return step
    })
    setSteps(updatedSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Please sign in to submit feedback")
      return
    }

    setLoading(true)
    try {
      // Users can create multiple feedbacks now

      const filteredSteps = steps.filter(step => step.stepType && step.stepName)
        .map(step => ({
          ...step,
          completedAt: step.completedAt ? new Date(step.completedAt) : null
        }))

      await feedbackService.createFeedback({
        title: formData.title,
        country: formData.country || undefined,
        program: formData.program,
        userId: user.uid,
        steps: filteredSteps,
        isActive: true
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to submit your feedback.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Your Immigration Feedback</CardTitle>
            <p className="text-muted-foreground">
              Share your immigration journey to help others in the community
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="title">Title *</Label>
                    <span className={`text-xs ${
                      formData.title.length > 100 
                        ? 'text-red-500' 
                        : formData.title.length > 80 
                        ? 'text-orange-500' 
                        : 'text-muted-foreground'
                    }`}>
                      {formData.title.length}/100
                    </span>
                  </div>
                  <Input
                    id="title"
                    required
                    maxLength={100}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Express Entry - Software Engineer from India"
                    className={formData.title.length > 100 ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep it concise and descriptive for better visibility
                  </p>
                </div>

                <div>
                  <Label htmlFor="program">Immigration Program *</Label>
                  <Select
                    required
                    value={formData.program}
                    onValueChange={(value) => setFormData({ ...formData, program: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Country of Origin</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., India, Philippines, Nigeria"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Process Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Step Type *</Label>
                            <Select
                              required
                              value={step.stepType}
                              onValueChange={(value) => updateStep(index, "stepType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select step" />
                              </SelectTrigger>
                              <SelectContent>
                                {stepOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Completion Date</Label>
                            <Input
                              type="date"
                              value={step.completedAt}
                              onChange={(e) => updateStep(index, "completedAt", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label>Comment (Optional)</Label>
                          <Textarea
                            value={step.comment}
                            onChange={(e) => updateStep(index, "comment", e.target.value)}
                            placeholder="Share any details about this step..."
                          />
                        </div>

                        {steps.length > 1 && (
                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeStep(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Feedback"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}