"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PolicyAnalysis, PolicyGap } from "@/lib/policy-analyzer"

interface PolicyHealthCardProps {
  analysis: PolicyAnalysis
  onFixGap?: (gapId: string) => void
}

export function PolicyHealthCard({ analysis, onFixGap }: PolicyHealthCardProps) {
  const { healthScore, gaps, summary, citations } = analysis

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-blue-600 dark:text-blue-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Needs Attention'
  }

  const getGapIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨'
      case 'warning': return '⚠️'
      case 'optimization': return '💡'
      default: return '📋'
    }
  }

  const getGapBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive'
      case 'warning': return 'default'
      case 'optimization': return 'secondary'
      default: return 'outline'
    }
  }

  const criticalGaps = gaps.filter(g => g.type === 'critical')
  const warningGaps = gaps.filter(g => g.type === 'warning')
  const optimizationGaps = gaps.filter(g => g.type === 'optimization')

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Policy Health Score</CardTitle>
            <CardDescription>Autonomous analysis by AI agent</CardDescription>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(healthScore)}`}>
              {healthScore}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {getScoreLabel(healthScore)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">{summary}</p>
        </div>

        {/* Gap Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {criticalGaps.length}
            </div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {warningGaps.length}
            </div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {optimizationGaps.length}
            </div>
            <div className="text-xs text-muted-foreground">Optimizations</div>
          </div>
        </div>

        {/* Gaps List */}
        {gaps.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {gaps.map((gap) => (
                <GapCard key={gap.id} gap={gap} onFix={onFixGap} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🎉</div>
            <p>No issues found! Your policy looks great.</p>
          </div>
        )}

        {/* Citations */}
        {citations.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Sources:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {citations.map((citation, idx) => (
                <li key={idx}>• {citation}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function GapCard({ gap, onFix }: { gap: PolicyGap; onFix?: (gapId: string) => void }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getGapIcon(gap.type)}</span>
            <h4 className="font-semibold text-sm">{gap.title}</h4>
          </div>
          <div className="flex gap-2 mb-2">
            <Badge variant={getGapBadgeVariant(gap.type)} className="text-xs">
              {gap.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {gap.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-foreground">{gap.message}</p>

      {/* Reasoning */}
      <div className="bg-muted p-3 rounded text-xs space-y-2">
        <p><span className="font-semibold">Why this matters:</span> {gap.reasoning}</p>
        <p><span className="font-semibold">Recommendation:</span> {gap.recommendation}</p>
      </div>

      {/* Risk/Savings */}
      {(gap.potentialRisk || gap.potentialSavings) && (
        <div className="flex gap-2 text-xs">
          {gap.potentialRisk && (
            <div className="flex-1 p-2 bg-red-50 dark:bg-red-950 rounded">
              <span className="font-semibold text-red-600 dark:text-red-400">Risk: </span>
              <span className="text-muted-foreground">{gap.potentialRisk}</span>
            </div>
          )}
          {gap.potentialSavings && (
            <div className="flex-1 p-2 bg-green-50 dark:bg-green-950 rounded">
              <span className="font-semibold text-green-600 dark:text-green-400">Savings: </span>
              <span className="text-muted-foreground">${gap.potentialSavings}/year</span>
            </div>
          )}
        </div>
      )}

      {/* Source */}
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold">Source:</span> {gap.source}
      </p>

      {/* Action Button */}
      {onFix && (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full"
          onClick={() => onFix(gap.id)}
        >
          Get Quotes to Fix This
        </Button>
      )}
    </div>
  )
}

function getGapIcon(type: string) {
  switch (type) {
    case 'critical': return '🚨'
    case 'warning': return '⚠️'
    case 'optimization': return '💡'
    default: return '📋'
  }
}

function getGapBadgeVariant(type: string): "default" | "destructive" | "secondary" | "outline" {
  switch (type) {
    case 'critical': return 'destructive'
    case 'warning': return 'default'
    case 'optimization': return 'secondary'
    default: return 'outline'
  }
}


