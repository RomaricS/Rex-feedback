"use client"

import { useState } from "react"
import { useRouter, Link } from "../../../../../i18n/routing"
import { useAuth } from "@/contexts/auth-context"
import { feedbackService } from "@/lib/feedback-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react"
import { ProjectBanner } from "@/components/project-banner"

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
  { value: "ITA", label: "Invitation to Apply (ITA)", order: 1, required: true },
  { value: "AOR", label: "Acknowledgment of Receipt (AOR)", order: 2, requires: ["ITA"] },
  { value: "MIL", label: "Medical Instruction Letter (MIL)", order: 3, requires: ["AOR"] },
  { value: "MEDICAL_PASSED", label: "Medical Passed", order: 4, requires: ["MIL"] },
  { value: "BIL", label: "Biometric Instruction Letter (BIL)", order: 3, requires: ["AOR"] },
  { value: "BIOMETRICS_PASSED", label: "Biometrics Passed", order: 4, requires: ["BIL"] },
  { value: "BACKGROUND_CHECK", label: "Background Check", order: 5, requires: ["AOR"] },
  { value: "PPR", label: "Passport Request (PPR)", order: 6, requires: ["AOR"] },
  { value: "COPR", label: "Confirmation of Permanent Residence (COPR)", order: 7, requires: ["PPR"] },
  { value: "ECOPR", label: "Electronic COPR (eCOPR)", order: 7, requires: ["PPR"] },
  { value: "LANDING", label: "Landing/First Entry", order: 8, requires: ["COPR", "ECOPR"] },
]

// Helper function to get available step options based on existing steps
const getAvailableStepOptions = (existingSteps: ProcessStep[], currentStepIndex?: number) => {
  const existingStepTypes = existingSteps
    .map((step, index) => index !== currentStepIndex ? step.stepType : null)
    .filter(Boolean)

  return stepOptions.filter(option => {
    // Don't allow duplicate steps
    if (existingStepTypes.includes(option.value)) {
      return false
    }

    // Always allow ITA as the first step
    if (option.value === "ITA") {
      return true
    }

    // For other steps, check if requirements are met
    if (option.requires) {
      return option.requires.some(requirement => existingStepTypes.includes(requirement))
    }

    return true
  }).sort((a, b) => a.order - b.order)
}

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
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  
  const [formData, setFormData] = useState({
    title: "",
    country: "N/A",
    program: "",
    applicationType: "", // inland or outland
  })
  
  const [steps, setSteps] = useState<ProcessStep[]>([
    { stepType: "", stepName: "", completedAt: "", comment: "" }
  ])

  const addStep = (afterIndex?: number) => {
    const newStep = { stepType: "", stepName: "", completedAt: "", comment: "" }
    if (afterIndex !== undefined) {
      const newSteps = [...steps]
      newSteps.splice(afterIndex + 1, 0, newStep)
      setSteps(newSteps)
    } else {
      setSteps([...steps, newStep])
    }
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

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    // Validate basic form fields
    if (!formData.title.trim()) {
      errors.title = "Title is required"
    }
    if (!formData.program) {
      errors.program = "Immigration program is required"  
    }
    if (!formData.applicationType) {
      errors.applicationType = "Application type is required"
    }

    // Validate steps
    const validSteps = steps.filter(step => step.stepType)
    if (validSteps.length === 0) {
      errors.steps = "At least one process step is required"
    }

    // Validate each step
    validSteps.forEach((step, index) => {
      if (!step.completedAt) {
        errors[`step_${index}_date`] = "Completion date is required for each step"
      }
    })

    // Check for ITA requirement if there are multiple steps
    if (validSteps.length > 1 && !validSteps.some(step => step.stepType === "ITA")) {
      errors.ita_required = "ITA (Invitation to Apply) step is required when adding multiple steps"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous validation errors
    setValidationErrors({})
    
    if (!user && !isAnonymous) {
      alert("Please sign in or submit anonymously")
      return
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const filteredSteps = steps.filter(step => step.stepType && step.stepName && step.completedAt)
        .map(step => ({
          ...step,
          completedAt: new Date(step.completedAt!)
        }))

      await feedbackService.createFeedback({
        title: formData.title,
        country: formData.country || undefined,
        program: formData.program,
        applicationType: formData.applicationType,
        userId: user?.uid || 'anonymous',
        steps: filteredSteps,
        isActive: true
      }, isAnonymous)

      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setValidationErrors({ 
        submit: "Failed to submit feedback. Please check your information and try again." 
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-2xl mx-auto">
        <ProjectBanner />
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
          <Button variant="ghost" size="sm" asChild className="h-10 md:h-9">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back to Dashboard</span>
              <span className="sm:hidden ml-2">Back</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-xl md:text-2xl">Add Your Immigration Feedback</CardTitle>
            <p className="text-muted-foreground text-sm md:text-base">
              Share your immigration journey to help others in the community
            </p>
            {!user && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 md:space-y-3">
                    <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
                      You can submit feedback anonymously or sign in to manage your submissions later. Check this box to submit anonymously.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="anonymous"
                        className="border-blue-600 dark:border-blue-400 checked:bg-blue-600 dark:checked:bg-blue-400 focus:ring-blue-500"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                      />
                      <Label htmlFor="anonymous" className="text-xs md:text-sm font-medium text-blue-800 dark:text-blue-200">
                        Submit anonymously
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
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
                    placeholder="e.g., James - CRS 520"
                    className={validationErrors.title ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.title && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>
                  )}
                  {!validationErrors.title && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Keep it short and descriptive
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="program">Immigration Program *</Label>
                  <Select
                    required
                    value={formData.program}
                    onValueChange={(value) => setFormData({ ...formData, program: value })}
                  >
                    <SelectTrigger className={validationErrors.program ? 'border-red-500 focus:border-red-500' : ''}>
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
                  {validationErrors.program && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.program}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="applicationType">Application Type *</Label>
                  <Select
                    required
                    value={formData.applicationType}
                    onValueChange={(value) => setFormData({ ...formData, applicationType: value })}
                  >
                    <SelectTrigger className={validationErrors.applicationType ? 'border-red-500 focus:border-red-500' : ''}>
                      <SelectValue placeholder="Select application type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inland">Inland (Applying from within Canada)</SelectItem>
                      <SelectItem value="outland">Outland (Applying from outside Canada)</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.applicationType && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.applicationType}</p>
                  )}
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
                  <Label className="text-lg font-semibold">Process Steps</Label>
                </div>
                
                {validationErrors.steps && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{validationErrors.steps}</p>
                  </div>
                )}
                
                {validationErrors.ita_required && (
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">{validationErrors.ita_required}</p>
                  </div>
                )}

                <div className="space-y-3 md:space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="space-y-3">
                      <Card>
                        <CardContent className="p-3 md:p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                                  {getAvailableStepOptions(steps, index).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {index === 0 && !steps.some(s => s.stepType === "ITA") && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  💡 Start with ITA (Invitation to Apply) - it's required for processing time calculations
                                </p>
                              )}
                              {index > 0 && !steps.some(s => s.stepType === "ITA") && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                  ⚠️ ITA step is required first for logical step ordering
                                </p>
                              )}
                            </div>

                            <div>
                              <Label>Completion Date *</Label>
                              <Input
                                type="date"
                                required
                                value={step.completedAt}
                                onChange={(e) => updateStep(index, "completedAt", e.target.value)}
                                className={validationErrors[`step_${index}_date`] ? 'border-red-500 focus:border-red-500' : ''}
                              />
                              {validationErrors[`step_${index}_date`] && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors[`step_${index}_date`]}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 md:mt-4 md:col-span-2">
                            <Label>Comment (Optional)</Label>
                            <Textarea
                              value={step.comment}
                              onChange={(e) => updateStep(index, "comment", e.target.value)}
                              placeholder="Share any details about this step..."
                              className="min-h-[80px] md:min-h-[100px]"
                            />
                          </div>

                          <div className="flex justify-between mt-3 md:mt-4 md:col-span-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addStep(index)}
                              className="h-9 md:h-10"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Step After
                            </Button>
                            {steps.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeStep(index)}
                                className="h-9 md:h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                  
                  {/* Sticky bottom Add Step button */}
                  <div className="sticky bottom-4 flex justify-center pt-4">
                    <Button
                      type="button"
                      onClick={() => addStep()}
                      className="shadow-lg bg-primary hover:bg-primary/90 h-12 px-6"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Step
                    </Button>
                  </div>
                </div>
              </div>

              {validationErrors.submit && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{validationErrors.submit}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" disabled={loading} className="h-11 md:h-10 order-1 sm:order-1">
                  {loading ? "Submitting..." : "Submit Feedback"}
                </Button>
                <Button type="button" variant="outline" asChild className="h-11 md:h-10 order-2 sm:order-2">
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