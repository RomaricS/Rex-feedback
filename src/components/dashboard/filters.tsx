"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

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

const countries = [
  "India",
  "China",
  "Philippines",
  "Nigeria",
  "Pakistan",
  "Brazil",
  "United States",
  "United Kingdom",
]

const statuses = [
  { value: "ITA", label: "ITA Received" },
  { value: "AOR", label: "AOR Received" },
  { value: "MIL", label: "Medical Instruction" },
  { value: "MEDICAL_PASSED", label: "Medical Passed" },
  { value: "BIL", label: "Biometric Instruction" },
  { value: "BIOMETRICS_PASSED", label: "Biometrics Passed" },
  { value: "PPR", label: "PPR Received" },
  { value: "COPR", label: "COPR Received" },
  { value: "ECOPR", label: "eCOPR Received" },
  { value: "LANDING", label: "Landed" },
]

interface FiltersProps {
  onFiltersChange: (filters: {
    search?: string
    program?: string
    country?: string
    status?: string
  }) => void
}

export function Filters({ onFiltersChange }: FiltersProps) {
  const [search, setSearch] = useState("")
  const [program, setProgram] = useState<string>("")
  const [country, setCountry] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({
        search: search || undefined,
        program: program || undefined,
        country: country || undefined,
        status: status || undefined,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [search, program, country, status, onFiltersChange])

  const clearAllFilters = () => {
    setSearch("")
    setProgram("")
    setCountry("")
    setStatus("")
  }

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'program':
        setProgram("")
        break
      case 'country':
        setCountry("")
        break
      case 'status':
        setStatus("")
        break
    }
  }

  const handleProgramChange = (value: string) => {
    setProgram(value === "clear" ? "" : value)
  }

  const handleCountryChange = (value: string) => {
    setCountry(value === "clear" ? "" : value)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value === "clear" ? "" : value)
  }

  const activeFilters = [
    program && { type: 'program', value: program, label: program },
    country && { type: 'country', value: country, label: country },
    status && { type: 'status', value: status, label: statuses.find(s => s.value === status)?.label || status },
  ].filter(Boolean)

  return (
    <Card className="h-fit glass-card shadow-canadian transition-smooth">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-400/20 rounded-lg">
              <span className="text-sm">🔍</span>
            </div>
            <span>Filters</span>
          </div>
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilters.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search feedbacks..."
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="program">Immigration Program</Label>
          <Select value={program} onValueChange={handleProgramChange}>
            <SelectTrigger className="h-auto min-h-[2.5rem] text-left">
              <SelectValue placeholder="Select program">
                {program && (
                  <span className="block truncate text-sm leading-tight py-1">
                    {program.length > 35 ? `${program.substring(0, 35)}...` : program}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] w-[var(--radix-select-trigger-width)] min-w-[280px]">
              <SelectItem value="clear" className="font-medium text-muted-foreground">
                All Programs
              </SelectItem>
              {programs.map((programOption) => (
                <SelectItem key={programOption} value={programOption} className="py-2">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-sm leading-tight">{programOption}</span>
                    {programOption.includes(' - ') && (
                      <span className="text-xs text-muted-foreground">
                        {programOption.split(' - ')[0]}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              <SelectItem value="clear" className="font-medium text-muted-foreground">
                All Countries
              </SelectItem>
              {countries.map((countryOption) => (
                <SelectItem key={countryOption} value={countryOption}>
                  {countryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              <SelectItem value="clear" className="font-medium text-muted-foreground">
                All Statuses
              </SelectItem>
              {statuses.map((statusOption) => (
                <SelectItem key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter.type} variant="secondary" className="flex items-center gap-1 max-w-full">
                  <span className="truncate max-w-[200px] text-xs">
                    {filter.label && filter.label.length > 25 
                      ? `${filter.label.substring(0, 25)}...` 
                      : filter.label
                    }
                  </span>
                  <X 
                    className="h-3 w-3 cursor-pointer flex-shrink-0" 
                    onClick={() => removeFilter(filter.type)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {activeFilters.length > 0 && (
          <Button variant="outline" className="w-full" onClick={clearAllFilters}>
            Clear All Filters ({activeFilters.length})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}