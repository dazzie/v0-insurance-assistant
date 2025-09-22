"use client"

import { Button } from "@/components/ui/button"
import { generateSuggestedPrompts, formatPromptButton } from "@/lib/suggested-prompts"
import { validatePrompts } from "@/lib/prompt-validator"

interface SuggestedPromptsProps {
  messages: Array<{ role: string; content: string }>
  customerProfile: any
  onPromptClick: (prompt: string) => void
  isLoading: boolean
}

export function SuggestedPrompts({ 
  messages, 
  customerProfile, 
  onPromptClick,
  isLoading 
}: SuggestedPromptsProps) {
  
  const prompts = generateSuggestedPrompts(messages, customerProfile)
  
  // Final validation check before rendering
  const validation = validatePrompts(messages, prompts)
  if (!validation.valid && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Prompt validation failed in SuggestedPrompts component')
  }
  
  if (isLoading || prompts.length === 0) {
    return null
  }
  
  return (
    <div className="px-4 pb-2">
      <p className="text-xs text-muted-foreground mb-2">Suggested responses:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => {
          const formatted = formatPromptButton(prompt)
          return (
            <Button
              key={index}
              onClick={() => onPromptClick(formatted.value)}
              variant={formatted.variant}
              size="sm"
              className="text-xs"
            >
              {formatted.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}