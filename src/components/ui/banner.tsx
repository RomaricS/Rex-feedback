"use client"

import { useState, useEffect } from "react"
import { X, Info, Heart } from "lucide-react"
import { Button } from "./button"

interface BannerProps {
  id: string
  children: React.ReactNode
  variant?: "info" | "success" | "warning"
  className?: string
}

export function Banner({ id, children, variant = "info", className = "" }: BannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const dismissed = localStorage.getItem(`banner-dismissed-${id}`)
    setIsVisible(!dismissed)
  }, [id])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(`banner-dismissed-${id}`, "true")
  }

  if (!isClient || !isVisible) {
    return null
  }

  const variantStyles = {
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100"
  }

  const iconVariants = {
    info: <Info className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5" />,
    success: <Heart className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5" />,
    warning: <Info className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5" />
  }

  return (
    <div className={`border rounded-lg p-3 md:p-4 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start gap-2 md:gap-3">
        {iconVariants[variant]}
        <div className="flex-1 text-sm md:text-base">
          {children}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-black/5 dark:hover:bg-white/5 -mt-1 -mr-1 flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  )
}