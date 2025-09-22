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
export function extractCollectedInfo(messages: Array<{ role: string; content: string }>): CollectedInfo {
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
      const driverMatch = content.match(/(\d+)\s*(?:driver|person|people)/i)
      if (driverMatch && !info.numberOfDrivers) {
        info.numberOfDrivers = parseInt(driverMatch[1])
        // Initialize driver array
        info.drivers = Array(info.numberOfDrivers).fill({}).map(() => ({}))
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
            const modelMatch = content.match(new RegExp(`${make}\\s+(\\w+)`, 'i'))
            if (modelMatch) {
              info.vehicles[vehicleIndex].model = modelMatch[1]
            }
          }
        }
      })
      
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
  // Priority order for collection
  const priority = [
    'number_of_vehicles',
    'number_of_drivers',
    'zip_code',
    'vehicle_1_year',
    'vehicle_1_make',
    'vehicle_1_model',
    'vehicle_1_mileage',
    'vehicle_1_use',
    'driver_1_age',
    'driver_1_experience',
    'driver_1_marital',
    'driver_1_violations',
    'coverage_level',
    'deductible_preference'
  ]
  
  for (const item of priority) {
    if (missing.includes(item)) {
      return item
    }
    // Check for numbered items (vehicle_2, driver_2, etc)
    const pattern = item.replace('_1_', '_\\d+_')
    const match = missing.find(m => m.match(new RegExp(pattern)))
    if (match) return match
  }
  
  return missing[0] || null
}