/**
 * Text extraction utilities for processing insurance policy images
 * Integrates with the MCP server for OCR and text extraction
 */

export interface ExtractionResult {
  text: string
  confidence?: number
  metadata?: {
    processingTime?: number
    imageSize?: { width: number; height: number }
  }
}

/**
 * Extract text from an image using the MCP server
 * @param imageData - Base64 encoded image data
 * @returns Extracted text
 */
export async function extractTextFromImage(imageData: string): Promise<string> {
  try {
    const response = await fetch('/api/extract-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        format: 'base64'
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to extract text from image')
    }
    
    const result = await response.json()
    return result.text
    
  } catch (error) {
    console.error('Text extraction error:', error)
    throw new Error('Failed to extract text from image. Please try again.')
  }
}

/**
 * Parse insurance policy text to extract structured data
 * @param text - Raw extracted text
 * @returns Structured policy data
 */
export function parseInsurancePolicy(text: string): Record<string, any> {
  const data: Record<string, any> = {}
  
  // Extract policy number
  const policyMatch = text.match(/(?:policy\s*(?:number|#|no\.?)\s*:?\s*)([A-Z0-9\-]+)/i)
  if (policyMatch) data.policyNumber = policyMatch[1]
  
  // Extract insurer
  const insurerMatch = text.match(/(?:insured\s*by|insurance\s*company|carrier)\s*:?\s*([A-Za-z\s&]+)/i)
  if (insurerMatch) data.insurer = insurerMatch[1].trim()
  
  // Extract coverage amounts
  const coverageMatch = text.match(/(?:coverage|liability)\s*(?:amount|limit)?\s*:?\s*\$?([\d,]+)/i)
  if (coverageMatch) data.coverageAmount = `$${coverageMatch[1]}`
  
  // Extract deductible
  const deductibleMatch = text.match(/(?:deductible)\s*:?\s*\$?([\d,]+)/i)
  if (deductibleMatch) data.deductible = `$${deductibleMatch[1]}`
  
  // Extract premium
  const premiumMatch = text.match(/(?:premium|payment|cost)\s*:?\s*\$?([\d,]+\.?\d*)/i)
  if (premiumMatch) data.premium = `$${premiumMatch[1]}`
  
  // Extract dates
  const dateMatch = text.match(/(?:effective|start)\s*(?:date)?\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) data.effectiveDate = dateMatch[1]
  
  const expMatch = text.match(/(?:expires?|end)\s*(?:date)?\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (expMatch) data.expirationDate = expMatch[1]
  
  // Extract vehicle info
  const yearMatch = text.match(/(\d{4})\s*(?:year|model\s*year)/i)
  if (yearMatch) data.vehicleYear = yearMatch[1]
  
  const makeModelMatch = text.match(/([A-Za-z]+)\s+([A-Za-z0-9\s]+)/i)
  if (makeModelMatch) {
    data.vehicleMake = makeModelMatch[1]
    data.vehicleModel = makeModelMatch[2]
  }
  
  const vinMatch = text.match(/(?:vin|vehicle\s*id)\s*:?\s*([A-Z0-9]{17})/i)
  if (vinMatch) data.vehicleVin = vinMatch[1]
  
  // Extract driver info
  const nameMatch = text.match(/(?:driver|insured)\s*(?:name)?\s*:?\s*([A-Za-z\s]+)/i)
  if (nameMatch) data.driverName = nameMatch[1].trim()
  
  return data
}

/**
 * Validate extracted policy data
 * @param data - Extracted policy data
 * @returns Validation result
 */
export function validatePolicyData(data: Record<string, any>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields
  if (!data.policyNumber) errors.push('Policy number not found')
  if (!data.insurer) errors.push('Insurance company not found')
  
  // Optional but important fields
  if (!data.coverageAmount) warnings.push('Coverage amount not found')
  if (!data.premium) warnings.push('Premium amount not found')
  if (!data.effectiveDate) warnings.push('Effective date not found')
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
