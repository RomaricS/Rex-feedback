"use client"

import { Banner } from "./ui/banner"
import { Heart, Shield, Edit } from "lucide-react"

export function ProjectBanner() {
  return (
    <Banner id="project-info" variant="info" className="mb-4 md:mb-6">
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span className="font-semibold text-sm md:text-base">Free Community Project</span>
        </div>
        
        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm leading-relaxed">
          <div className="flex items-start gap-2">
            <Shield className="h-3 w-3 md:h-4 md:w-4 mt-0.5 text-green-600 flex-shrink-0" />
            <span>Your data stays secure - we don't collect, sell, or misuse your information</span>
          </div>
          
          <div className="flex items-start gap-2">
            <Edit className="h-3 w-3 md:h-4 md:w-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span>Submit feedback anonymously or sign in to edit/delete your entries later</span>
          </div>
        </div>

        <p className="text-xs md:text-sm opacity-90 italic">
          Built to help the immigration community share experiences in one place, instead of scattered across groups and sheets.
        </p>
      </div>
    </Banner>
  )
}