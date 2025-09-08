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
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    country: "",
    program: "",
    applicationType: "", // inland or outland
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
    if (!user && !isAnonymous) {
      alert("Please sign in or submit anonymously")
      return
    }

    setLoading(true)
    try {
      const filteredSteps = steps.filter(step => step.stepType && step.stepName)
        .map(step => ({
          ...step,
          completedAt: step.completedAt ? new Date(step.completedAt) : null
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
      alert("Failed to submit feedback")
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
                    className={formData.title.length > 100 ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep it short and descriptive
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
                  <Label htmlFor="applicationType">Application Type *</Label>
                  <Select
                    required
                    value={formData.applicationType}
                    onValueChange={(value) => setFormData({ ...formData, applicationType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select application type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inland">Inland (Applying from within Canada)</SelectItem>
                      <SelectItem value="outland">Outland (Applying from outside Canada)</SelectItem>
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

                <div className="space-y-3 md:space-y-4">
                  {steps.map((step, index) => (
                    <Card key={index}>
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

                        <div className="mt-3 md:mt-4 md:col-span-2">
                          <Label>Comment (Optional)</Label>
                          <Textarea
                            value={step.comment}
                            onChange={(e) => updateStep(index, "comment", e.target.value)}
                            placeholder="Share any details about this step..."
                            className="min-h-[80px] md:min-h-[100px]"
                          />
                        </div>

                        {steps.length > 1 && (
                          <div className="flex justify-end mt-3 md:mt-4 md:col-span-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeStep(index)}
                              className="h-9 md:h-10"
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