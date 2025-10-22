// Track collected information and determine what's still needed
// This helps generate smarter prompts that don't repeat collected info

export interface CollectedInfo {
  // Basic counts
  numberOfVehicles?: number
  numberOfDrivers?: number
  
  // Vehicle details (per vehicle)
  vehicles: {
    year?: number
    make?: string
    model?: string
    mileage?: number
    primaryUse?: 'commute' | 'pleasure' | 'business'
    parkingLocation?: 'garage' | 'driveway' | 'street'
  }[]
  
  // Driver details (per driver)
  drivers: {
    age?: number
    yearsLicensed?: number
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
    violations?: boolean
    violationDetails?: string[]
  }[]
  
  // Coverage preferences
  coverage: {
    currentCarrier?: string
    currentPremium?: number
    desiredCoverage?: 'minimum' | 'standard' | 'full'
    deductible?: number
    hasGapInsurance?: boolean
    wantsRoadside?: boolean
    wantsRental?: boolean
  }
  
  // Location
  location: {
    state?: string
    zipCode?: string
  }
}

// Parse messages to extract collected information
export function extractCollectedInfo(messages: Array<{ role: string; content: string }>, customerProfile?: any): CollectedInfo {
  const info: CollectedInfo = {
    vehicles: [],
    drivers: [],
    coverage: {},
    location: {}
  }
  
  messages.forEach(msg => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase()
      
      // Extract vehicle count
      const vehicleMatch = content.match(/(\d+)\s*(?:car|vehicle|auto)/i)
      if (vehicleMatch && !info.numberOfVehicles) {
        info.numberOfVehicles = parseInt(vehicleMatch[1])
        // Initialize vehicle array
        info.vehicles = Array(info.numberOfVehicles).fill({}).map(() => ({}))
      }
      
      // Extract driver count
      // Check for "just me" or similar phrases first
      if ((content.includes('just me') || content.includes('only me') || content.includes("i'm the only") || content.includes('myself')) && !info.numberOfDrivers) {
        info.numberOfDrivers = 1
        info.drivers = [{}]
      } else {
        const driverMatch = content.match(/(\d+)\s*(?:driver|person|people)/i)
        if (driverMatch && !info.numberOfDrivers) {
          info.numberOfDrivers = parseInt(driverMatch[1])
          // Initialize driver array
          info.drivers = Array(info.numberOfDrivers).fill({}).map(() => ({}))
        }
      }
      
      // Extract vehicle details
      const yearMatch = content.match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        const year = parseInt(yearMatch[0])
        // Add to first vehicle without year
        const vehicleIndex = info.vehicles.findIndex(v => !v.year)
        if (vehicleIndex !== -1) {
          info.vehicles[vehicleIndex].year = year
        }
      }
      
      // Extract make/model
      const makes = ['toyota', 'honda', 'ford', 'chevy', 'chevrolet', 'tesla', 'bmw', 'mercedes', 'nissan', 'mazda', 'hyundai', 'kia', 'volkswagen', 'audi', 'lexus']
      makes.forEach(make => {
        if (content.includes(make)) {
          const vehicleIndex = info.vehicles.findIndex(v => !v.make)
          if (vehicleIndex !== -1) {
            info.vehicles[vehicleIndex].make = make
            // Try to find model after make
            // Capture everything after the make as the model (handles multi-word models)
            const modelPattern = new RegExp(`${make}\\s+(.+?)(?:\\.|,|\\s*$|\\s{2,})`, 'i')
            const modelMatch = content.match(modelPattern)
            if (modelMatch) {
              // Clean up the model name (remove extra spaces, common words at the end)
              let model = modelMatch[1].trim()
              // Remove common trailing words that aren't part of the model
              model = model.replace(/\s*(car|vehicle|auto|suv|truck|sedan)$/i, '').trim()
              if (model && model.toLowerCase() !== make) {
                info.vehicles[vehicleIndex].model = model
              }
            }
          }
        }
      })
      
      // Special case: If user just enters a model name (e.g., "Model 3" after being asked for model)
      // This handles when the assistant specifically asks "What model?" and user responds with just the model
      if (!content.includes('year') && !content.includes('make')) {
        // Check if we have a vehicle with a make but no model
        const vehicleNeedingModel = info.vehicles.find(v => v.make && !v.model)
        if (vehicleNeedingModel) {
          // Common Tesla models (Model 3, Model S, Model X, Model Y, Cybertruck)
          if (content.match(/model\s*[3syxc]/i)) {
            const modelMatch = content.match(/(model\s*[3syxc])/i)
            if (modelMatch) {
              // Normalize the format (e.g., "model3" -> "Model 3", "Model 3" -> "Model 3")
              const modelLetter = modelMatch[1].match(/[3syxc]/i)?.[0].toUpperCase()
              vehicleNeedingModel.model = `Model ${modelLetter}`
            }
          } else if (content.match(/cybertruck/i)) {
            vehicleNeedingModel.model = 'Cybertruck'
          }
          // For other makes, if the response is short (likely just a model name), use it
          else if (content.length < 30 && !content.includes('?')) {
            // Clean up the content and use as model
            const cleanedModel = content.trim().replace(/[.,!]$/g, '')
            if (cleanedModel && cleanedModel.length > 0) {
              vehicleNeedingModel.model = cleanedModel
            }
          }
        }
      }
      
      // Extract mileage
      const mileageMatch = content.match(/(\d+)(?:k|\s*000)?\s*(?:mile|mi)/i)
      if (mileageMatch) {
        const mileage = mileageMatch[1].includes('k') ? parseInt(mileageMatch[1]) * 1000 : parseInt(mileageMatch[1])
        const vehicleIndex = info.vehicles.findIndex(v => !v.mileage)
        if (vehicleIndex !== -1) {
          info.vehicles[vehicleIndex].mileage = mileage
        }
      }
      
      // Extract parking location
      if (content.includes('garage')) {
        const vehicleIndex = info.vehicles.findIndex(v => !v.parkingLocation)
        if (vehicleIndex !== -1) info.vehicles[vehicleIndex].parkingLocation = 'garage'
      } else if (content.includes('driveway')) {
        const vehicleIndex = info.vehicles.findIndex(v => !v.parkingLocation)
        if (vehicleIndex !== -1) info.vehicles[vehicleIndex].parkingLocation = 'driveway'
      } else if (content.includes('street')) {
        const vehicleIndex = info.vehicles.findIndex(v => !v.parkingLocation)
        if (vehicleIndex !== -1) info.vehicles[vehicleIndex].parkingLocation = 'street'
      }
      
      // Extract use type
      if (content.includes('commut') || content.includes('work')) {
        const vehicleIndex = info.vehicles.findIndex(v => !v.primaryUse)
        if (vehicleIndex !== -1) info.vehicles[vehicleIndex].primaryUse = 'commute'
      } else if (content.includes('pleasure') || content.includes('personal')) {
        const vehicleIndex = info.vehicles.findIndex(v => !v.primaryUse)
        if (vehicleIndex !== -1) info.vehicles[vehicleIndex].primaryUse = 'pleasure'
      } else if (content.includes('business')) {
        const vehicleIndex = info.vehicles.findIndex(v => !v.primaryUse)
        if (vehicleIndex !== -1) info.vehicles[vehicleIndex].primaryUse = 'business'
      }
      
      // Extract driver age
      const ageMatch = content.match(/\b(\d{2})\s*(?:years?\s*old|yo)\b/i) || 
                       content.match(/age\s*(\d{2})/i) ||
                       content.match(/i'?m?\s*(\d{2})\b/i)
      if (ageMatch) {
        const age = parseInt(ageMatch[1])
        if (age >= 16 && age <= 99) {
          const driverIndex = info.drivers.findIndex(d => !d.age)
          if (driverIndex !== -1) info.drivers[driverIndex].age = age
        }
      }
      
      // Extract marital status
      if (content.includes('married')) {
        const driverIndex = info.drivers.findIndex(d => !d.maritalStatus)
        if (driverIndex !== -1) info.drivers[driverIndex].maritalStatus = 'married'
      } else if (content.includes('single')) {
        const driverIndex = info.drivers.findIndex(d => !d.maritalStatus)
        if (driverIndex !== -1) info.drivers[driverIndex].maritalStatus = 'single'
      }
      
      // Extract violations
      if (content.includes('clean record') || content.includes('no accident') || content.includes('no ticket') || content.includes('no violation')) {
        info.drivers.forEach(d => { if (!d.violations) d.violations = false })
      } else if (content.includes('accident') || content.includes('ticket') || content.includes('violation') || content.includes('speeding')) {
        const driverIndex = info.drivers.findIndex(d => d.violations === undefined)
        if (driverIndex !== -1) info.drivers[driverIndex].violations = true
      }
      
      // Extract current carrier
      const carriers = ['state farm', 'geico', 'progressive', 'allstate', 'usaa', 'liberty', 'farmers', 'nationwide', 'american family', 'travelers']
      carriers.forEach(carrier => {
        if (content.includes(carrier)) {
          info.coverage.currentCarrier = carrier
        }
      })
      
      // Extract current premium
      const premiumMatch = content.match(/\$?(\d+)\s*(?:\/?\s*(?:month|mo))/i)
      if (premiumMatch) {
        info.coverage.currentPremium = parseInt(premiumMatch[1])
      }
      
      // Extract deductible preference
      const deductibleMatch = content.match(/\$?(\d+)\s*deductible/i)
      if (deductibleMatch) {
        info.coverage.deductible = parseInt(deductibleMatch[1])
      }
      
      // Extract coverage level
      if (content.includes('minimum') || content.includes('basic') || content.includes('liability only')) {
        info.coverage.desiredCoverage = 'minimum'
      } else if (content.includes('full coverage') || content.includes('comprehensive')) {
        info.coverage.desiredCoverage = 'full'
      }
      
      // Extract ZIP code
      const zipMatch = content.match(/\b(\d{5})\b/)
      if (zipMatch) {
        info.location.zipCode = zipMatch[1]
      }
    }
  })
  
  // After processing messages, if customer profile has age and we have 1 driver, use it
  if (customerProfile?.age && info.numberOfDrivers === 1) {
    // Ensure drivers array exists and has at least one element
    if (info.drivers.length === 0) {
      info.drivers = [{}]
    }
    // Set age from profile if not explicitly collected
    if (!info.drivers[0].age) {
      info.drivers[0].age = parseInt(customerProfile.age)
    }
  }
  
  // If customer profile has ZIP code saved, use it
  if (customerProfile?.zipCode && !info.location.zipCode) {
    console.log('[Info Tracker] Using ZIP code from profile:', customerProfile.zipCode)
    // Extract just the 5-digit ZIP if it's ZIP+4 format
    const zipMatch = customerProfile.zipCode.match(/^(\d{5})/)
    if (zipMatch) {
      info.location.zipCode = zipMatch[1]
    } else {
      info.location.zipCode = customerProfile.zipCode
    }
  }
  
  // If customer profile has enriched vehicles (from policy scan), use them
  if (customerProfile?.vehicles && customerProfile.vehicles.length > 0) {
    const enrichedVehicles = customerProfile.vehicles.filter((v: any) => v.enriched)
    
    // If we have enriched vehicles, use them instead of conversation-extracted data
    if (enrichedVehicles.length > 0) {
      // Set vehicle count if not already set
      if (!info.numberOfVehicles) {
        info.numberOfVehicles = customerProfile.vehiclesCount || enrichedVehicles.length
      }
      
      // Use enriched vehicle data
      info.vehicles = enrichedVehicles.map((v: any) => ({
        year: v.year,
        make: v.make,
        model: v.model,
        mileage: v.annualMileage,
        primaryUse: v.primaryUse,
      }))
      
      console.log('[Info Tracker] Using enriched vehicles from profile:', info.vehicles)
    }
  }
  
  return info
}

// Determine what information is still needed
export function getMissingInfo(collected: CollectedInfo): string[] {
  const missing: string[] = []
  
  // Check basic counts
  if (!collected.numberOfVehicles) {
    missing.push('number_of_vehicles')
  }
  if (!collected.numberOfDrivers) {
    missing.push('number_of_drivers')
  }
  
  // Check vehicle details
  if (collected.numberOfVehicles) {
    for (let i = 0; i < collected.numberOfVehicles; i++) {
      const vehicle = collected.vehicles[i] || {}
      if (!vehicle.year) missing.push(`vehicle_${i + 1}_year`)
      if (!vehicle.make) missing.push(`vehicle_${i + 1}_make`)
      if (!vehicle.model) missing.push(`vehicle_${i + 1}_model`)
      if (!vehicle.mileage) missing.push(`vehicle_${i + 1}_mileage`)
      if (!vehicle.primaryUse) missing.push(`vehicle_${i + 1}_use`)
    }
  }
  
  // Check driver details
  if (collected.numberOfDrivers) {
    for (let i = 0; i < collected.numberOfDrivers; i++) {
      const driver = collected.drivers[i] || {}
      if (!driver.age) missing.push(`driver_${i + 1}_age`)
      if (!driver.yearsLicensed) missing.push(`driver_${i + 1}_experience`)
      if (!driver.maritalStatus) missing.push(`driver_${i + 1}_marital`)
      if (driver.violations === undefined) missing.push(`driver_${i + 1}_violations`)
    }
  }
  
  // Check coverage preferences
  if (!collected.coverage.desiredCoverage) {
    missing.push('coverage_level')
  }
  if (!collected.coverage.deductible) {
    missing.push('deductible_preference')
  }
  
  // Check location
  if (!collected.location.zipCode) {
    missing.push('zip_code')
  }
  
  return missing
}

// Get the next piece of information to collect
export function getNextInfoToCollect(missing: string[]): string | null {
  // EFFICIENT COLLECTION: Get only what's absolutely required for quotes
  
  // Separate required from optional
  const requiredMissing = missing.filter(m => 
    m.includes('number_of_drivers') ||
    m.includes('number_of_vehicles') ||
    m.includes('zip_code') ||
    (m.includes('vehicle') && (m.includes('year') || m.includes('make') || m.includes('model'))) ||
    (m.includes('driver') && m.includes('age'))
  )
  
  const optionalMissing = missing.filter(m => !requiredMissing.includes(m))
  
  // PRIORITIZE REQUIRED FIELDS ONLY
  // If any required fields are missing, focus on those first
  if (requiredMissing.length > 0) {
    // 1. Basic counts - get these immediately
    if (requiredMissing.includes('number_of_drivers')) return 'number_of_drivers'
    if (requiredMissing.includes('number_of_vehicles')) return 'number_of_vehicles'
    if (requiredMissing.includes('zip_code')) return 'zip_code'
    
    // 2. Driver ages (required) - get all quickly
    const driverAgeMissing = requiredMissing.filter(m => m.includes('driver') && m.includes('age'))
    if (driverAgeMissing.length > 0) {
      // Sort by driver number and get first
      const sorted = driverAgeMissing.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '1')
        const numB = parseInt(b.match(/\d+/)?.[0] || '1')
        return numA - numB
      })
      return sorted[0]
    }
    
    // 3. Vehicle year/make/model (required) - get these efficiently
    const vehicleRequiredMissing = requiredMissing.filter(m => m.includes('vehicle'))
    if (vehicleRequiredMissing.length > 0) {
      // Process vehicles in order, year -> make -> model for each
      const vehicleNums = new Set<string>()
      vehicleRequiredMissing.forEach(item => {
        const match = item.match(/vehicle_(\d+)/)
        if (match) vehicleNums.add(match[1])
      })
      
      const sortedNums = Array.from(vehicleNums).sort((a, b) => parseInt(a) - parseInt(b))
      
      // Get year, make, model in that order for each vehicle
      for (const num of sortedNums) {
        if (requiredMissing.includes(`vehicle_${num}_year`)) return `vehicle_${num}_year`
        if (requiredMissing.includes(`vehicle_${num}_make`)) return `vehicle_${num}_make`
        if (requiredMissing.includes(`vehicle_${num}_model`)) return `vehicle_${num}_model`
      }
    }
  }
  
  // ONLY AFTER ALL REQUIRED FIELDS ARE COMPLETE, get optional info
  if (optionalMissing.length > 0) {
    // Priority order for optional fields (most impact on rates first)
    // 1. Driver years licensed (needed before violations)
    const experienceMissing = optionalMissing.filter(m => m.includes('experience'))
    if (experienceMissing.length > 0) return experienceMissing[0]
    
    // 2. Driver marital status (affects rates)
    const maritalMissing = optionalMissing.filter(m => m.includes('marital'))
    if (maritalMissing.length > 0) return maritalMissing[0]
    
    // 3. Driver violations (huge impact)
    const violationsMissing = optionalMissing.filter(m => m.includes('violations'))
    if (violationsMissing.length > 0) return violationsMissing[0]
    
    // 4. Vehicle mileage (significant impact)
    const mileageMissing = optionalMissing.filter(m => m.includes('mileage'))
    if (mileageMissing.length > 0) return mileageMissing[0]
    
    // 5. Coverage level (determines quotes)
    if (optionalMissing.includes('coverage_level')) return 'coverage_level'
    
    // 6. Deductible preference
    if (optionalMissing.includes('deductible_preference')) return 'deductible_preference'
    
    // 7. Everything else
    return optionalMissing[0]
  }
  
  // Fallback
  return missing[0] || null
}