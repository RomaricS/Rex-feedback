"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, Languages } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'

export function Header() {
  const { user, loading, signInWithGoogle, signInWithFacebook, signOut } = useAuth()
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

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
    router.push(pathname, {locale: newLocale})
  }

  return (
    <header className="glass-nav sticky top-0 z-50 transition-smooth">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="p-2 bg-maple-gradient rounded-lg shadow-maple transition-bounce">
            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <h1 className="text-base md:text-xl font-bold truncate bg-gradient-to-r from-red-600 to-blue-600 dark:from-red-400 dark:to-blue-400 bg-clip-text text-transparent">
            <span className="hidden sm:inline maple-accent">{t('dashboard')}</span>
            <span className="sm:hidden maple-accent">{t('dashboardShort')}</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
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