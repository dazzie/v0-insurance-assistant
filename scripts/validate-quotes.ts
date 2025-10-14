#!/usr/bin/env tsx
/**
 * Quote Engine Validation Script
 * Compares engine output against real-world quotes
 */

import { QuoteEngine } from '../lib/quote-engine/engine'

interface ValidationCase {
  name: string
  profile: {
    state: string
    age: number
    creditTier: string
    vehicleType: string
    vehicleYear: number
    coverageLevel: string
    deductible: number
    violations: number
    annualMileage: number
    zipCode: string
  }
  actualQuotes: {
    [carrier: string]: number // actual monthly premium
  }
}

const testCases: ValidationCase[] = [
  {
    name: "Kenneth Crann - 2015 Tesla Model S, San Francisco",
    profile: {
      state: "CA",
      age: 35,
      creditTier: "good",
      vehicleType: "sedan",
      vehicleYear: 2015,
      coverageLevel: "standard",
      deductible: 1000,
      violations: 0,
      annualMileage: 10500,
      zipCode: "94122"
    },
    actualQuotes: {
      "progressive": 140,  // $1,675/year from actual policy
      // Add more as you collect them
    }
  },
  // Add more validation cases here
]

function validateQuotes() {
  console.log('🧪 Quote Engine Validation Report\n')
  console.log('=' .repeat(80))
  
  const quoteEngine = new QuoteEngine()
  let totalTests = 0
  let totalAccurate = 0
  const accuracyThreshold = 0.15 // ±15% is acceptable
  
  testCases.forEach(testCase => {
    console.log(`\n📋 Test Case: ${testCase.name}`)
    console.log('-'.repeat(80))
    
    const engineRequest = {
      insuranceType: 'auto' as const,
      ...testCase.profile,
    }
    
    const result = quoteEngine.generateQuotes(engineRequest)
    
    console.log(`\n${'Carrier'.padEnd(25)} ${'Engine'.padStart(12)} ${'Actual'.padStart(12)} ${'Diff'.padStart(12)} ${'Status'.padStart(12)}`)
    console.log('-'.repeat(80))
    
    Object.entries(testCase.actualQuotes).forEach(([carrierId, actualMonthly]) => {
      const engineQuote = result.quotes.find(q => q.carrierId === carrierId)
      
      if (!engineQuote) {
        console.log(`${carrierId.padEnd(25)} ${'N/A'.padStart(12)} ${'$' + actualMonthly + '/mo'.padStart(11)} ${'-'.padStart(12)} ${'⚠️ Not Found'.padStart(12)}`)
        return
      }
      
      const engineMonthly = engineQuote.monthlyPremium
      const diff = engineMonthly - actualMonthly
      const diffPct = (diff / actualMonthly) * 100
      const isAccurate = Math.abs(diffPct) <= accuracyThreshold * 100
      
      totalTests++
      if (isAccurate) totalAccurate++
      
      const status = isAccurate ? '✅ Accurate' : '❌ Off Target'
      const diffStr = `${diff > 0 ? '+' : ''}${diff} (${diffPct.toFixed(1)}%)`
      
      console.log(
        `${engineQuote.carrierName.padEnd(25)} ` +
        `${'$' + engineMonthly + '/mo'.padStart(11)} ` +
        `${'$' + actualMonthly + '/mo'.padStart(11)} ` +
        `${diffStr.padStart(15)} ` +
        `${status.padStart(12)}`
      )
      
      if (!isAccurate) {
        console.log(`  ⚠️  Adjustment needed: Multiply current premium by ${(actualMonthly / engineMonthly).toFixed(2)}`)
      }
    })
  })
  
  console.log('\n' + '='.repeat(80))
  console.log(`\n📊 Summary: ${totalAccurate}/${totalTests} quotes accurate (${((totalAccurate/totalTests)*100).toFixed(1)}%)`)
  console.log(`✅ Target: ±${accuracyThreshold * 100}% variance acceptable\n`)
  
  if (totalAccurate < totalTests) {
    console.log('🔧 Calibration Recommendations:')
    console.log('  1. Review carrier regional adjustments')
    console.log('  2. Check base rates against latest state data')
    console.log('  3. Validate multiplier stacking (age + credit + vehicle)')
    console.log('  4. Consider increasing base rates by ~30-40%')
  }
}

// Run validation
validateQuotes()

