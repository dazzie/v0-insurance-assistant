import { ConfigLoader } from './config-loader'
import type { CompiledConfig } from './types'

export class ConfigCompiler {
  private static instance: CompiledConfig | null = null

  static compile(): CompiledConfig {
    if (this.instance) {
      return this.instance
    }

    console.log('🔧 Compiling quote engine configuration...')
    const startTime = performance.now()

    const baseRates = ConfigLoader.loadBaseRates()
    const ageFactors = ConfigLoader.loadAgeFactors()
    const creditFactors = ConfigLoader.loadCreditFactors()
    const vehicleFactors = ConfigLoader.loadVehicleFactors()
    const carriers = ConfigLoader.loadAllCarriers()

    // Build age lookup table (Float32Array for memory efficiency)
    const ageLookup = new Float32Array(105) // ages 16-120
    ageFactors.auto.brackets.forEach((bracket: any) => {
      for (let age = bracket.min; age <= bracket.max; age++) {
        ageLookup[age - 16] = bracket.multiplier
      }
    })

    // Build other lookup maps
    const creditLookup = new Map<string, number>()
    Object.entries(creditFactors.tiers).forEach(([tier, data]: [string, any]) => {
      creditLookup.set(tier, data.multiplier)
    })

    const vehicleTypeLookup = new Map(Object.entries(vehicleFactors.vehicleTypes))
    const vehicleAgeLookup = new Map(Object.entries(vehicleFactors.vehicleAge))
    const mileageLookup = new Map(Object.entries(vehicleFactors.annualMileage))
    const violationLookup = new Map(Object.entries(vehicleFactors.violations))

    const baseRatesMap = new Map<string, number>()
    Object.entries(baseRates.auto.stateAverages).forEach(([state, rate]) => {
      baseRatesMap.set(`auto-${state}`, rate as number)
    })
    Object.entries(baseRates.home.stateAverages).forEach(([state, rate]) => {
      baseRatesMap.set(`home-${state}`, rate as number)
    })
    Object.entries(baseRates.renters.stateAverages).forEach(([state, rate]) => {
      baseRatesMap.set(`renters-${state}`, rate as number)
    })

    const coverageLevels = new Map<string, number>()
    Object.entries(baseRates.auto.coverageLevels).forEach(([level, mult]) => {
      coverageLevels.set(`auto-${level}`, mult as number)
    })
    Object.entries(baseRates.home.coverageLevels).forEach(([level, mult]) => {
      coverageLevels.set(`home-${level}`, mult as number)
    })

    const deductibles = new Map(Object.entries(baseRates.auto.deductibles))

    this.instance = {
      baseRates: baseRatesMap,
      ageLookup,
      creditLookup,
      vehicleTypeLookup,
      vehicleAgeLookup,
      mileageLookup,
      violationLookup,
      carriers: new Map(carriers.map(c => [c.id, c])),
      coverageLevels,
      deductibles,
    }

    const duration = performance.now() - startTime
    console.log(`✅ Quote engine compiled in ${duration.toFixed(2)}ms:`)
    console.log(`   - ${carriers.length} carriers loaded`)
    console.log(`   - ${baseRatesMap.size} base rates indexed`)
    console.log(`   - ${ageLookup.length} age brackets pre-computed`)
    console.log(`   - Memory footprint: ~${this.estimateMemoryUsage()} KB`)

    return this.instance
  }

  static reload() {
    ConfigLoader.reloadConfig()
    this.instance = null
    return this.compile()
  }

  private static estimateMemoryUsage(): number {
    if (!this.instance) return 0
    
    // Rough estimate in KB
    const ageLookupSize = this.instance.ageLookup.byteLength / 1024
    const mapsSize = (
      this.instance.baseRates.size +
      this.instance.creditLookup.size +
      this.instance.vehicleTypeLookup.size +
      this.instance.carriers.size
    ) * 0.1 // ~100 bytes per entry estimate
    
    return Math.round(ageLookupSize + mapsSize)
  }
}

