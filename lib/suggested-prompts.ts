// Generate contextual suggested prompts based on conversation state
// Helps users continue the conversation with relevant options

import { extractCollectedInfo, getMissingInfo, getNextInfoToCollect } from './information-tracker'
import { validatePrompts, debugPromptMismatch } from './prompt-validator'

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
  const collectedInfo = extractCollectedInfo(messages, customerProfile)
  const missingInfo = getMissingInfo(collectedInfo)
  const nextToCollect = getNextInfoToCollect(missingInfo)
  
  // Check if the last assistant message contains quote information
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()
  const hasQuoteInfo = lastAssistantMessage?.content && (
    lastAssistantMessage.content.includes('Estimated Premium') ||
    lastAssistantMessage.content.includes('Carrier Recommendation') ||
    lastAssistantMessage.content.includes('ready for quotes') ||
    lastAssistantMessage.content.includes('Carrier Conversation Toolkit')
  )
  
  // If quotes have been provided, show action prompts
  if (hasQuoteInfo) {
    return getQuoteReadyPrompts()
  }
  
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
    
    // Only return action prompts if no info prompts (already collected)
    if (infoPrompts.length === 0) {
      return actionPrompts
    }
    return [...actionPrompts.slice(0, 2), ...infoPrompts.slice(0, 2)]
  }
  
  if (missingInfo.length === 0) {
    return getQuoteReadyPrompts()
  }
  
  // Generate prompts for the next piece of missing information
  let prompts = getPromptsForNextInfo(nextToCollect, collectedInfo)
  
  // If the current information was already provided, try the next one
  if (prompts.length === 0 && missingInfo.length > 0) {
    // Keep trying until we find something that needs prompts
    let remainingMissing = [...missingInfo]
    while (remainingMissing.length > 0) {
      const nextItem = getNextInfoToCollect(remainingMissing)
      if (!nextItem) break
      
      const nextPrompts = getPromptsForNextInfo(nextItem, collectedInfo)
      if (nextPrompts.length > 0) {
        prompts = nextPrompts
        break
      }
      
      // Remove this item and try again
      remainingMissing = remainingMissing.filter(item => item !== nextItem)
    }
  }
  
  // CRITICAL: Validate prompts match the question
  const validation = validatePrompts(messages, prompts)
  if (!validation.valid) {
    // Log the mismatch for debugging
    const lastQuestion = messages.filter(m => m.role === 'assistant').pop()?.content || ''
    debugPromptMismatch(
      lastQuestion, 
      validation.actualPrompts || [], 
      validation.expectedCategory || 'unknown',
      validation.confidence
    )
    
    // When not confident, show NO prompts (better than wrong prompts)
    return []
  }
  
  // Additional confidence check: if prompts seem misaligned with context
  const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop()?.content || ''
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || ''
  
  // If the last user message seems to have answered the question, don't show old prompts
  if (lastUserMsg && prompts.length > 0) {
    // Check if any prompt text appears in the user's last answer
    const userAnsweredWithPrompt = prompts.some(p => 
      lastUserMsg.toLowerCase().includes(p.text.toLowerCase())
    )
    
    if (userAnsweredWithPrompt) {
      // User just selected one of these prompts, don't show them again
      return []
    }
  }
  
  return prompts
}

function getPromptsForNextInfo(nextInfo: string | null, collected: any): SuggestedPrompt[] {
  if (!nextInfo) return getQuoteReadyPrompts()
  
  // Generate specific prompts based on what info is needed next
  // These prompts should be direct answers to the questions being asked
  // BUT ONLY if the information hasn't been collected yet
  
  if (nextInfo === 'number_of_vehicles') {
    // Don't show prompts if already collected
    if (collected.numberOfVehicles) return []
    
    // Question: "How many vehicles need coverage?"
    return [
      { text: "Just 1 vehicle", icon: "🚗", category: 'info' },
      { text: "2 vehicles", icon: "🚙", category: 'info' },
      { text: "3 vehicles", icon: "🚐", category: 'info' },
      { text: "4 or more vehicles", icon: "🚛", category: 'info' }
    ]
  }
  
  if (nextInfo === 'number_of_drivers') {
    // Don't show prompts if already collected
    if (collected.numberOfDrivers) return []
    
    // Question: "How many drivers will be on the policy?"
    return [
      { text: "Just me", icon: "👤", category: 'info' },
      { text: "2 drivers", icon: "👥", category: 'info' },
      { text: "3 drivers", icon: "👨‍👩‍👦", category: 'info' },
      { text: "4 or more drivers", icon: "👨‍👩‍👧‍👦", category: 'info' }
    ]
  }
  
  if (nextInfo === 'zip_code') {
    // Don't show prompts if already collected
    if (collected.location?.zipCode) return []
    
    // Question: "What ZIP code will the vehicles be garaged in?"
    return [
      { text: "94105", icon: "📍", category: 'info' },
      { text: "Use my location", icon: "📌", category: 'info' },
      { text: "I'll enter it manually", icon: "✍️", category: 'action' },
      { text: "Why do you need ZIP code?", icon: "❓", category: 'question' }
    ]
  }
  
  if (nextInfo.includes('vehicle_') && nextInfo.includes('_year')) {
    // Get vehicle number and check if this specific vehicle's year is already collected
    const vehicleNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.vehicles[vehicleNum]?.year) return []
    
    // Question: "What year is vehicle X?"
    return [
      { text: "2024", icon: "✨", category: 'info' },
      { text: "2022", icon: "🚗", category: 'info' },
      { text: "2020", icon: "🚙", category: 'info' },
      { text: "2018", icon: "🚘", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('vehicle_') && nextInfo.includes('_make')) {
    // Get vehicle number and check if this specific vehicle's make is already collected
    const vehicleNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.vehicles[vehicleNum]?.make) return []
    
    // Question: "What make is vehicle X?"
    return [
      { text: "Toyota", icon: "🇯🇵", category: 'info' },
      { text: "Honda", icon: "🇯🇵", category: 'info' },
      { text: "Ford", icon: "🇺🇸", category: 'info' },
      { text: "Chevrolet", icon: "🇺🇸", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('vehicle_') && nextInfo.includes('_model')) {
    // Get vehicle number and check if this specific vehicle's model is already collected
    const vehicleNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.vehicles[vehicleNum]?.model) return []
    
    // Question: "What model is vehicle X?"
    // Check what make was selected to provide relevant model options
    const vehicleMake = collected.vehicles[vehicleNum]?.make?.toLowerCase()
    
    if (vehicleMake === 'toyota') {
      return [
        { text: "Camry", icon: "🚗", category: 'info' },
        { text: "Corolla", icon: "🚙", category: 'info' },
        { text: "RAV4", icon: "🚐", category: 'info' },
        { text: "Highlander", icon: "🚛", category: 'info' }
      ]
    } else if (vehicleMake === 'honda') {
      return [
        { text: "Accord", icon: "🚗", category: 'info' },
        { text: "Civic", icon: "🚙", category: 'info' },
        { text: "CR-V", icon: "🚐", category: 'info' },
        { text: "Pilot", icon: "🚛", category: 'info' }
      ]
    } else if (vehicleMake === 'ford') {
      return [
        { text: "F-150", icon: "🚛", category: 'info' },
        { text: "Explorer", icon: "🚐", category: 'info' },
        { text: "Escape", icon: "🚙", category: 'info' },
        { text: "Mustang", icon: "🏎️", category: 'info' }
      ]
    } else if (vehicleMake === 'chevrolet' || vehicleMake === 'chevy') {
      return [
        { text: "Silverado", icon: "🚛", category: 'info' },
        { text: "Malibu", icon: "🚗", category: 'info' },
        { text: "Equinox", icon: "🚐", category: 'info' },
        { text: "Tahoe", icon: "🚙", category: 'info' }
      ]
    } else if (vehicleMake === 'tesla') {
      return [
        { text: "Model 3", icon: "⚡", category: 'info' },
        { text: "Model Y", icon: "⚡", category: 'info' },
        { text: "Model S", icon: "⚡", category: 'info' },
        { text: "Model X", icon: "⚡", category: 'info' }
      ]
    }
    
    // Generic options if make is unknown or not in our list
    return [
      { text: "Sedan", icon: "🚗", category: 'info' },
      { text: "SUV", icon: "🚐", category: 'info' },
      { text: "Truck", icon: "🚛", category: 'info' },
      { text: "I'll type the model", icon: "✍️", category: 'action' }
    ]
  }
  
  if (nextInfo.includes('vehicle_') && nextInfo.includes('_mileage')) {
    // Get vehicle number and check if this specific vehicle's mileage is already collected
    const vehicleNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.vehicles[vehicleNum]?.mileage) return []
    
    // Question: "How many miles per year for vehicle X?"
    return [
      { text: "Under 5,000 miles", icon: "🏠", category: 'info' },
      { text: "About 10,000 miles", icon: "🛣️", category: 'info' },
      { text: "About 12,000 miles", icon: "🚗", category: 'info' },
      { text: "Over 15,000 miles", icon: "🛤️", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('vehicle_') && nextInfo.includes('_use')) {
    // Get vehicle number and check if this specific vehicle's use is already collected
    const vehicleNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.vehicles[vehicleNum]?.primaryUse) return []
    
    // Question: "Is vehicle X for commuting, pleasure, or business?"
    return [
      { text: "Commuting", icon: "🏢", category: 'info' },
      { text: "Pleasure", icon: "🎯", category: 'info' },
      { text: "Business", icon: "💼", category: 'info' },
      { text: "Both commute and pleasure", icon: "🔄", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('driver_') && nextInfo.includes('_age')) {
    // Get driver number and check if this specific driver's age is already collected
    const driverNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.drivers[driverNum]?.age) return []
    
    // Question: "How old is driver X?"
    return [
      { text: "18", icon: "🎓", category: 'info' },
      { text: "25", icon: "🎂", category: 'info' },
      { text: "35", icon: "👤", category: 'info' },
      { text: "45", icon: "👔", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('driver_') && nextInfo.includes('_marital')) {
    // Get driver number and check if this specific driver's marital status is already collected
    const driverNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.drivers[driverNum]?.maritalStatus) return []
    
    return [
      { text: "Single", icon: "👤", category: 'info' },
      { text: "Married", icon: "💑", category: 'info' },
      { text: "Divorced", icon: "📄", category: 'info' },
      { text: "Widowed", icon: "🕊️", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('driver_') && nextInfo.includes('_experience')) {
    // Get driver number and check if this specific driver's experience is already collected
    const driverNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.drivers[driverNum]?.yearsLicensed) return []
    
    // Question: "How many years has driver X been licensed?"
    return [
      { text: "Less than 1 year", icon: "🆕", category: 'info' },
      { text: "3 years", icon: "📅", category: 'info' },
      { text: "5 years", icon: "📆", category: 'info' },
      { text: "10+ years", icon: "🎖️", category: 'info' }
    ]
  }
  
  if (nextInfo.includes('driver_') && nextInfo.includes('_violations')) {
    // Get driver number and check if this specific driver's violations are already collected
    const driverNum = parseInt(nextInfo.match(/\d+/)?.[0] || '1') - 1
    if (collected.drivers[driverNum]?.violations !== undefined) return []
    
    // Question: "Does driver X have a clean driving record?"
    return [
      { text: "Yes, clean record", icon: "✅", category: 'info' },
      { text: "1 speeding ticket", icon: "⚠️", category: 'info' },
      { text: "1 accident", icon: "💥", category: 'info' },
      { text: "Multiple violations", icon: "🚨", category: 'info' }
    ]
  }
  
  if (nextInfo === 'coverage_level') {
    // Don't show prompts if already collected
    if (collected.coverage?.desiredCoverage) return []
    
    return [
      { text: "State minimum only", icon: "📊", category: 'info' },
      { text: "Standard coverage", icon: "🛡️", category: 'info' },
      { text: "Full coverage", icon: "🏆", category: 'info' },
      { text: "What do you recommend?", icon: "💡", category: 'question' }
    ]
  }
  
  if (nextInfo === 'deductible_preference') {
    // Don't show prompts if already collected
    if (collected.coverage?.deductible) return []
    
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
    // Initial greeting asks: "How many drivers will be on this policy?"
    return [
      { text: "Just me", icon: "👤", category: 'info' },
      { text: "Me and my spouse", icon: "👥", category: 'info' },
      { text: "Family with teen driver", icon: "👨‍👩‍👧", category: 'info' },
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
    { text: "Compare these carriers", icon: "📊", category: 'action' },
    { text: "What questions should I ask carriers?", icon: "❓", category: 'question' },
    { text: "How can I lower these premiums?", icon: "💰", category: 'question' },
    { text: "Print my carrier toolkit", icon: "🖨️", category: 'action' }
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