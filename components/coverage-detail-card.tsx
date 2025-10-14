"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCoverageExplanation, normalizeCoverageName } from "@/lib/coverage-explanations"
import { ChevronDown, ChevronRight, Info, Shield, AlertCircle, CheckCircle2 } from "lucide-react"

interface Coverage {
  name: string
  premium?: string | number
  limit?: string
  deductible?: string
}

interface CoverageDetailCardProps {
  coverage: Coverage
}

export function CoverageDetailCard({ coverage }: CoverageDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const normalizedName = normalizeCoverageName(coverage.name)
  const explanation = getCoverageExplanation(normalizedName)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <h3 className="font-semibold text-sm truncate">{coverage.name}</h3>
              {explanation?.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
              {coverage.premium && (
                <span className="font-medium text-foreground">
                  ${typeof coverage.premium === 'number' ? coverage.premium : coverage.premium}
                </span>
              )}
              {coverage.limit && (
                <span>Limit: {coverage.limit}</span>
              )}
              {coverage.deductible && (
                <span>Deductible: {coverage.deductible}</span>
              )}
            </div>
          </div>
          
          {explanation && (
            <Info className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && explanation && (
          <div className="px-4 pb-4 space-y-4 border-t bg-muted/20">
            {/* Description */}
            <div className="pt-4">
              <p className="text-sm text-foreground leading-relaxed">
                {explanation.description}
              </p>
            </div>

            {/* What It Covers */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold">What It Covers</h4>
              </div>
              <ul className="space-y-1 ml-6">
                {explanation.whatItCovers.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What It Doesn't Cover */}
            {explanation.whatItDoesntCover && explanation.whatItDoesntCover.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <h4 className="text-sm font-semibold">What It Doesn't Cover</h4>
                </div>
                <ul className="space-y-1 ml-6">
                  {explanation.whatItDoesntCover.map((item, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Points */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold">Key Points</h4>
              </div>
              <ul className="space-y-1 ml-6">
                {explanation.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deductible Info */}
            {explanation.deductibleInfo && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">💡 Deductible: </span>
                  {explanation.deductibleInfo}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Explanation Available */}
        {isExpanded && !explanation && (
          <div className="px-4 pb-4 pt-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground italic">
              Detailed information for this coverage type is not available. Contact your insurance carrier for specific details.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Component to display multiple coverages
interface CoverageDetailListProps {
  coverages: Coverage[]
  title?: string
}

export function CoverageDetailList({ coverages, title = "Coverage Details" }: CoverageDetailListProps) {
  return (
    <div className="space-y-2">
      {title && (
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
      )}
      <div className="space-y-2">
        {coverages.map((coverage, idx) => (
          <CoverageDetailCard key={idx} coverage={coverage} />
        ))}
      </div>
    </div>
  )
}

