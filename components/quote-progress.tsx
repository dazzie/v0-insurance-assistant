"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle } from "lucide-react"

interface QuoteProgressProps {
  collectedInfo: {
    drivers: boolean
    vehicles: boolean
    coverage: boolean
    history: boolean
  }
}

export function QuoteProgress({ collectedInfo }: QuoteProgressProps) {
  const steps = [
    { key: 'drivers', label: 'Driver Information', completed: collectedInfo.drivers },
    { key: 'vehicles', label: 'Vehicle Details', completed: collectedInfo.vehicles },
    { key: 'coverage', label: 'Coverage Preferences', completed: collectedInfo.coverage },
    { key: 'history', label: 'Insurance History', completed: collectedInfo.history },
  ]
  
  const completedSteps = steps.filter(s => s.completed).length
  const progressValue = (completedSteps / steps.length) * 100

  return (
    <div className="border rounded-lg p-4 bg-muted/30 mb-4">
      <h3 className="text-sm font-medium mb-3">Quote Readiness: {progressValue.toFixed(0)}%</h3>
      
      <Progress value={progressValue} className="mb-3 h-2" />
      
      <div className="grid grid-cols-2 gap-2">
        {steps.map((step) => (
          <div key={step.key} className="flex items-center gap-2 text-xs">
            {step.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      
      {progressValue === 100 && (
        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-800 dark:text-green-200">
          ✓ Ready for personalized quotes! I have all the information needed.
        </div>
      )}
    </div>
  )
}