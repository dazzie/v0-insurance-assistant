// Validate that prompts match the current question
// This prevents showing wrong options (e.g., violation prompts for years licensed question)

import type { SuggestedPrompt } from './suggested-prompts'

interface QuestionPromptMap {
  questionPattern: RegExp
  expectedPrompts: string[]
  category: string
}

// Define what prompts should appear for each question type
const QUESTION_PROMPT_MAPPINGS: QuestionPromptMap[] = [
  {
    questionPattern: /how many drivers/i,
    expectedPrompts: ['Just me', '2 drivers', '3 drivers', '4 or more drivers'],
    category: 'drivers_count'
  },
  {
    questionPattern: /how many vehicles/i,
    expectedPrompts: ['Just 1 vehicle', '2 vehicles', '3 vehicles', '4 or more vehicles'],
    category: 'vehicles_count'
  },
  {
    questionPattern: /zip code|ZIP code/i,
    expectedPrompts: ['94105', 'Use my location', "I'll enter it manually", 'Why do you need ZIP code?'],
    category: 'zip_code'
  },
  {
    questionPattern: /what year is/i,
    expectedPrompts: ['2024', '2022', '2020', '2018'],
    category: 'vehicle_year'
  },
  {
    questionPattern: /what make is/i,
    expectedPrompts: ['Toyota', 'Honda', 'Ford', 'Chevrolet'],
    category: 'vehicle_make'
  },
  {
    questionPattern: /what model/i,
    expectedPrompts: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Camry', 'Accord', 'F-150', 'Civic', 'CR-V', 'Sedan', 'SUV', 'Truck'],
    category: 'vehicle_model'
  },
  {
    questionPattern: /how old (is|are)/i,
    expectedPrompts: ['18', '25', '35', '45'],
    category: 'driver_age'
  },
  {
    questionPattern: /how many years.*licensed/i,
    expectedPrompts: ['Less than 1 year', '3 years', '5 years', '10+ years'],
    category: 'years_licensed'
  },
  {
    questionPattern: /marital status/i,
    expectedPrompts: ['Single', 'Married', 'Divorced', 'Widowed'],
    category: 'marital_status'
  },
  {
    questionPattern: /clean driving record|violations/i,
    expectedPrompts: ['Yes, clean record', '1 speeding ticket', '1 accident', 'Multiple violations'],
    category: 'violations'
  },
  {
    questionPattern: /how many miles|annual mileage/i,
    expectedPrompts: ['Under 5,000 miles', 'About 10,000 miles', 'About 12,000 miles', 'Over 15,000 miles'],
    category: 'mileage'
  },
  {
    questionPattern: /commuting.*pleasure.*business|primary use/i,
    expectedPrompts: ['Commuting', 'Pleasure', 'Business', 'Both commute and pleasure'],
    category: 'vehicle_use'
  },
  {
    questionPattern: /level of coverage|coverage.*looking for/i,
    expectedPrompts: ['State minimum only', 'Standard coverage', 'Full coverage', 'What do you recommend?'],
    category: 'coverage_level'
  },
  {
    questionPattern: /deductible/i,
    expectedPrompts: ['$250 deductible', '$500 deductible', '$1000 deductible', '$1500+ deductible'],
    category: 'deductible'
  }
]

// Validate that prompts match the last question asked
export function validatePrompts(
  messages: Array<{ role: string; content: string }>,
  prompts: SuggestedPrompt[]
): { valid: boolean; expectedCategory?: string; actualPrompts?: string[]; confidence: number } {
  
  // Get the last assistant message (should be a question)
  const lastAssistantMessage = messages
    .filter(m => m.role === 'assistant')
    .pop()
  
  if (!lastAssistantMessage) {
    return { valid: false, confidence: 0 } // No question to validate against - not confident
  }
  
  const question = lastAssistantMessage.content
  
  // Find which question type this is
  const matchedMapping = QUESTION_PROMPT_MAPPINGS.find(mapping =>
    mapping.questionPattern.test(question)
  )
  
  if (!matchedMapping) {
    // Question type not recognized, NOT confident - don't show prompts
    return { valid: false, confidence: 0 }
  }
  
  // Check how many prompts match expected prompts for this question
  const promptTexts = prompts.map(p => p.text)
  let matchCount = 0
  
  promptTexts.forEach(text => {
    const matches = matchedMapping.expectedPrompts.some(expected =>
      text.toLowerCase().includes(expected.toLowerCase()) ||
      expected.toLowerCase().includes(text.toLowerCase())
    )
    if (matches) matchCount++
  })
  
  // Calculate confidence based on match percentage
  const confidence = prompts.length > 0 ? (matchCount / prompts.length) * 100 : 0
  
  // Require at least 75% confidence to show prompts
  const isValid = confidence >= 75
  
  return {
    valid: isValid,
    expectedCategory: matchedMapping.category,
    actualPrompts: promptTexts,
    confidence
  }
}

// Get the correct prompts for the current question
export function getCorrectPromptsForQuestion(
  lastQuestion: string
): { category: string; prompts: string[] } | null {
  
  const matchedMapping = QUESTION_PROMPT_MAPPINGS.find(mapping =>
    mapping.questionPattern.test(lastQuestion)
  )
  
  if (!matchedMapping) {
    return null
  }
  
  return {
    category: matchedMapping.category,
    prompts: matchedMapping.expectedPrompts
  }
}

// Debug function to log prompt validation issues
export function debugPromptMismatch(
  question: string,
  actualPrompts: string[],
  expectedCategory: string,
  confidence: number = 0
): void {
  console.warn('⚠️ PROMPT MISMATCH DETECTED:')
  console.warn(`Question: "${question}"`)
  console.warn(`Expected category: ${expectedCategory}`)
  console.warn(`Confidence: ${confidence.toFixed(1)}% (need 75%+)`)
  console.warn(`Actual prompts shown: ${actualPrompts.join(', ')}`)
  
  const correct = getCorrectPromptsForQuestion(question)
  if (correct) {
    console.warn(`Should show: ${correct.prompts.join(', ')}`)
  }
  console.warn('NOT showing prompts due to low confidence')
}