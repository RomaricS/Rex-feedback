"use client"

import { createContext, useContext, ReactNode } from "react"

interface SearchFilters {
  program?: string
  country?: string
  status?: string
  search?: string
}

interface SearchContextType {
  searchValue: string
  filters: SearchFilters
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchProviderProps {
  children: ReactNode
  searchValue: string
  filters: SearchFilters
}

export function SearchProvider({ children, searchValue, filters }: SearchProviderProps) {
  const combinedFilters = {
    ...filters,
    search: searchValue,
  }

  return (
    <SearchContext.Provider value={{ searchValue, filters: combinedFilters }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}