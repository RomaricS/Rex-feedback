"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Languages, Search, Filter, X } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '../../../i18n/routing'

const programs = [
  "Express Entry - General",
  "Express Entry - CEC (Canadian Experience Class)",
  "Express Entry - FSW (Federal Skilled Worker)",
  "Express Entry - PNP (Provincial Nominee Program)",
  "Provincial Nominee Program - General",
  "Quebec Skilled Worker Program",
  "Family Sponsorship - Spouse/Partner",
  "Start-up Visa Program",
]

const countries = [
  "India", "China", "Philippines", "Nigeria", "Pakistan", "United States", 
  "United Kingdom", "France", "Germany", "Brazil", "Mexico", "Iran", "Syria",
]

interface HeaderProps {
  onSearchChange?: (search: string) => void
  onFiltersChange?: (filters: { program?: string; country?: string; status?: string }) => void
  searchValue?: string
  filters?: { program?: string; country?: string; status?: string }
}

export function Header({ 
  onSearchChange, 
  onFiltersChange, 
  searchValue = "", 
  filters = {} 
}: HeaderProps) {
  const { user, loading, signInWithGoogle, signInWithFacebook, signOut } = useAuth()
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname() || '/'

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook()
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  const switchLanguage = (newLocale: string) => {
    try {
      router.push(pathname, {locale: newLocale})
    } catch (error) {
      // Fallback to dashboard if there's an error with pathname
      console.error("Error switching language, redirecting to dashboard:", error)
      router.push('/dashboard', {locale: newLocale})
    }
  }

  return (
    <header className="glass-nav sticky top-0 z-50 transition-smooth">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="p-2 bg-maple-gradient rounded-lg shadow-maple transition-bounce">
            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <h1 className="text-base md:text-xl font-bold truncate bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            <span className="hidden sm:inline">{t('dashboard')}</span>
            <span className="sm:hidden">{t('dashboardShort')}</span>
          </h1>
        </div>

        {/* Search and Filters - Center */}
        <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedbacks..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 pr-4 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearchChange?.("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden lg:inline">Filters</span>
                {(filters.program || filters.country || filters.status) && (
                  <span className="bg-primary text-primary-foreground rounded-full h-2 w-2"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="center">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter Feedbacks</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFiltersChange?.({})}
                    className="h-6 px-2 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Program</label>
                    <Select value={filters.program || "all"} onValueChange={(value) => 
                      onFiltersChange?.({ ...filters, program: value === "all" ? undefined : value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All programs</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program} value={program}>{program}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Country</label>
                    <Select value={filters.country || "all"} onValueChange={(value) => 
                      onFiltersChange?.({ ...filters, country: value === "all" ? undefined : value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All countries</SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={filters.status || "all"} onValueChange={(value) => 
                      onFiltersChange?.({ ...filters, status: value === "all" ? undefined : value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Search/Filter */}
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="h-4 w-4" />
                  {(searchValue || filters.program || filters.country || filters.status) && (
                    <span className="bg-primary text-primary-foreground rounded-full h-2 w-2"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search feedbacks..."
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      className="pl-9 pr-4"
                    />
                    {searchValue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => onSearchChange?.("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFiltersChange?.({})}
                      className="h-6 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <Select value={filters.program || "all"} onValueChange={(value) => 
                      onFiltersChange?.({ ...filters, program: value === "all" ? undefined : value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All programs</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program} value={program}>{program}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.country || "all"} onValueChange={(value) => 
                      onFiltersChange?.({ ...filters, country: value === "all" ? undefined : value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All countries</SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.status || "all"} onValueChange={(value) => 
                      onFiltersChange?.({ ...filters, status: value === "all" ? undefined : value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Languages className="h-4 w-4" />
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => switchLanguage('en')}
                className={locale === 'en' ? 'bg-accent' : ''}
              >
                🇬🇧 English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => switchLanguage('fr')}
                className={locale === 'fr' ? 'bg-accent' : ''}
              >
                🇫🇷 Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          {loading ? (
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button variant="ghost" size="sm" onClick={handleGoogleSignIn} className="text-xs md:text-sm">
                {t('signInWithGoogle')}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleFacebookSignIn} className="text-xs md:text-sm">
                {t('signInWithFacebook')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}