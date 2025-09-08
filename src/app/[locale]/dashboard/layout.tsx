"use client"

import { useState } from "react"
import { Header } from "@/components/navigation/header"
import { SearchProvider } from "@/contexts/search-context"
import { ProjectBanner } from "@/components/project-banner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [searchValue, setSearchValue] = useState("")
  const [filters, setFilters] = useState<{ program?: string; country?: string; status?: string }>({})

  const handleSearchChange = (search: string) => {
    setSearchValue(search)
  }

  const handleFiltersChange = (newFilters: { program?: string; country?: string; status?: string }) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearchChange={handleSearchChange}
        onFiltersChange={handleFiltersChange}
        searchValue={searchValue}
        filters={filters}
      />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <ProjectBanner />
        <SearchProvider searchValue={searchValue} filters={filters}>
          {children}
        </SearchProvider>
      </main>
    </div>
  )
}