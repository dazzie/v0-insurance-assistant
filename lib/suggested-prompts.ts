// Generate contextual suggested prompts based on conversation state
// Helps users continue the conversation with relevant options

import { extractCollectedInfo, getMissingInfo, getNextInfoToCollect } from './information-tracker'

export interface SuggestedPrompt {
  text: string
  icon?: string
  category?: 'info' | 'action' | 'question'
}

// Analyze conversation and generate next step suggestions
export function generateSuggestedPrompts(
  messages: Array<{ role: string; content: string }>,
  customerProfile: any
): SuggestedPrompt[] {
  
  if (messages.length === 0) {
    return getInitialPrompts(customerProfile)
  }
  
  // Extract what information we've already collected
  const collectedInfo = extractCollectedInfo(messages)
  const missingInfo = getMissingInfo(collectedInfo)
  const nextToCollect = getNextInfoToCollect(missingInfo)
  
  // If we have all essential info, show action prompts
  // Consider complete if we have vehicles, drivers, and basic details
  const hasEssentials = collectedInfo.numberOfVehicles && 
                        collectedInfo.numberOfDrivers &&
                        collectedInfo.vehicles.length > 0 &&
                        collectedInfo.drivers.length > 0
  
  if (hasEssentials && missingInfo.length <= 3) {
    // If only minor details missing, show both action and info prompts
    const actionPrompts = getQuoteReadyPrompts()
    const infoPrompts = getPromptsForNextInfo(nextToCollect, collectedInfo)
    return [...actionPrompts.slice(0, 2), ...infoPrompts.slice(0, 2)]
  }
  
  if (missingInfo.length === 0) {
    return getQuoteReadyPrompts()
  }
  
  // Generate prompts for the next piece of missing information
  return getPromptsForNextInfo(nextToCollect, collectedInfo)
}

function getPromptsForNextInfo(nextInfo: string | null, collected: any): SuggestedPrompt[] {
  if (!nextInfo) return getQuoteReadyPrompts()
  
  // Generate specific prompts based on what info is needed next
  if (nextInfo === 'number_of_vehicles') {
    return [
      { text: "1 vehicle", icon: "🚗", category: 'info' },
      { text: "2 vehicles", icon: "🚙", category: 'info' },
      { text: "3 vehicles", icon: "🚐", category: 'info' },
      { text: "4+ vehicles", icon: "🚛", category: 'info' }
    ]
  }
  
  if (nextInfo === 'number_of_drivers') {
    return [
      { text: "Just me (1 driver)", icon: "👤", category: 'info' },
      { text: "2 drivers", icon: "👥", category: 'info' },
      { text: "3 drivers", icon: "👨‍👩‍👦", category: 'info' },
      { text: "4+ drivers", icon: "👨‍👩‍👧‍👦", category: 'info' }
    ]
  }
  
  if (nextInfo === 'zip_code') {
    return [
      { text: "Enter ZIP manually", icon: "📍", category: 'action' },
      { text: "Use profile location", icon: "📌", category: 'info' },
      { text: "Why do you need this?", icon: "❓", category: 'question' }
    ]
  }
  
  if (nextInfo.includes('vehicle') && nextInfo.includes('year')) {
    return [
      { text: "2024 (brand new)", icon: "✨", category: 'info' },
      { text: "2020-2023", icon: "🚗", category: 'info' },
      { text: "2015-2019", icon: "🚙", category: 'info' },
      { text: "2014 or older", icon: "🚘", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('vehicle') && nextInfo.includes('make')) {
    return [
      { text: "Toyota", icon: "🇯🇵", category: 'info' },
      { text: "Honda", icon: "🇯🇵", category: 'info' },
      { text: "Ford", icon: "🇺🇸", category: 'info' },
      { text: "Other make", icon: "🚗", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('vehicle') && nextInfo.includes('mileage')) {
    return [
      { text: "Under 5,000 miles/year", icon: "🏠", category: 'info' },
      { text: "5,000-10,000 miles/year", icon: "🛣️", category: 'info' },
      { text: "10,000-15,000 miles/year", icon: "🚗", category: 'info' },
      { text: "Over 15,000 miles/year", icon: "🛤️", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('vehicle') && nextInfo.includes('use')) {
    return [
      { text: "Commute to work/school", icon: "🏢", category: 'info' },
      { text: "Personal/pleasure only", icon: "🎯", category: 'info' },
      { text: "Business use", icon: "💼", category: 'info' },
      { text: "Mixed use", icon: "🔄", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('driver') && nextInfo.includes('age')) {
    const driverNum = nextInfo.match(/\d+/)?.[0] || '1'
    return [
      { text: "16-20 years old", icon: "🎓", category: 'info' },
      { text: "21-25 years old", icon: "🎂", category: 'info' },
      { text: "26-65 years old", icon: "👤", category: 'info' },
      { text: "65+ years old", icon: "👴", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('driver') && nextInfo.includes('marital')) {
    return [
      { text: "Single", icon: "👤", category: 'info' },
      { text: "Married", icon: "💑", category: 'info' },
      { text: "Divorced", icon: "📄", category: 'info' },
      { text: "Widowed", icon: "🕊️", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('driver') && nextInfo.includes('violations')) {
    return [
      { text: "Clean record - no violations", icon: "✅", category: 'info' },
      { text: "1 minor violation", icon: "⚠️", category: 'info' },
      { text: "Multiple violations", icon: "🚨", category: 'info' },
      { text: "Had an accident", icon: "💥", category: 'info' }
    ]
  }
  
  if (nextInfo === 'coverage_level') {
    return [
      { text: "State minimum only", icon: "📊", category: 'info' },
      { text: "Standard coverage", icon: "🛡️", category: 'info' },
      { text: "Full coverage", icon: "🏆", category: 'info' },
      { text: "What do you recommend?", icon: "💡", category: 'question' }
    ]
  }
  
  if (nextInfo === 'deductible_preference') {
    return [
      { text: "$250 deductible", icon: "💵", category: 'info' },
      { text: "$500 deductible", icon: "💰", category: 'info' },
      { text: "$1000 deductible", icon: "🏦", category: 'info' },
      { text: "$1500+ deductible", icon: "🎯", category: 'info' }
    ]
  }
  
  // Default fallback
  return [
    { text: "Skip this question", icon: "⏭️", category: 'action' },
    { text: "Why do you need this?", icon: "❓", category: 'question' }
  ]
}

function getInitialPrompts(profile: any): SuggestedPrompt[] {
  const isAuto = profile?.needs?.includes('auto')
  
  if (isAuto) {
    // Start with the most important: number of vehicles
    return [
      { text: "1 vehicle", icon: "🚗", category: 'info' },
      { text: "2 vehicles", icon: "🚙", category: 'info' },
      { text: "3+ vehicles", icon: "🚐", category: 'info' },
      { text: "What info do you need?", icon: "❓", category: 'question' }
    ]
  }
  
  return [
    { text: "Show me top carriers in my area", icon: "🏢", category: 'action' },
    { text: "How can I lower my premium?", icon: "💰", category: 'question' },
    { text: "What coverage do I need?", icon: "🛡️", category: 'question' },
    { text: "Explain insurance terms", icon: "📚", category: 'question' }
  ]
}


function getQuoteReadyPrompts(): SuggestedPrompt[] {
  return [
    { text: "Generate my carrier toolkit", icon: "📋", category: 'action' },
    { text: "Show me estimated quotes", icon: "💵", category: 'action' },
    { text: "Which carriers are best for me?", icon: "🏆", category: 'question' },
    { text: "How do I negotiate better rates?", icon: "💪", category: 'question' }
  ]
}


// Format prompts for display
export function formatPromptButton(prompt: SuggestedPrompt): {
  label: string
  value: string
  variant: 'default' | 'secondary' | 'outline'
} {
  const variant = prompt.category === 'action' ? 'default' : 
                  prompt.category === 'question' ? 'outline' : 
                  'secondary'
  
  return {
    label: `${prompt.icon ? prompt.icon + ' ' : ''}${prompt.text}`,
    value: prompt.text,
    variant
  }
}