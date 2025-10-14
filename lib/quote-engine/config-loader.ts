import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { CarrierConfig, BaseRatesConfig, VehicleFactors } from './types'

const CONFIG_DIR = join(process.cwd(), 'config')

export class ConfigLoader {
  private static cache: Map<string, any> = new Map()

  static loadBaseRates(): BaseRatesConfig {
    return this.loadJSON<BaseRatesConfig>('factors/base-rates.json')
  }

  static loadAgeFactors(): any {
    return this.loadJSON('factors/age-factors.json')
  }

  static loadCreditFactors(): any {
    return this.loadJSON('factors/credit-factors.json')
  }

  static loadVehicleFactors(): VehicleFactors {
    return this.loadJSON<VehicleFactors>('factors/vehicle-factors.json')
  }

  static loadAllCarriers(): CarrierConfig[] {
    const carriersDir = join(CONFIG_DIR, 'carriers')
    const files = readdirSync(carriersDir).filter(f => f.endsWith('.json'))
    
    return files
      .map(file => this.loadJSON<CarrierConfig>(`carriers/${file}`))
      .filter(carrier => carrier.enabled)
      .sort((a, b) => b.marketShare - a.marketShare)
  }

  static loadCarrier(id: string): CarrierConfig | null {
    try {
      return this.loadJSON<CarrierConfig>(`carriers/${id}.json`)
    } catch {
      return null
    }
  }

  private static loadJSON<T>(relativePath: string): T {
    const cacheKey = relativePath
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as T
    }

    const filePath = join(CONFIG_DIR, relativePath)
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    
    this.cache.set(cacheKey, data)
    return data as T
  }

  static clearCache() {
    this.cache.clear()
  }

  static reloadConfig() {
    this.clearCache()
    console.log('✅ Config cache cleared, will reload on next access')
  }
}

