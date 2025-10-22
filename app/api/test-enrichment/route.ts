import { NextRequest, NextResponse } from 'next/server'
import { enrichVehicleData, assessCrimeRisk, assessFloodRisk } from '@/lib/enrichment-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('[Test] 🧪 Testing enrichment services...')
    
    // Test VIN enrichment
    console.log('[Test] 🚗 Testing VIN enrichment...')
    const vehicles = [{ vin: '5YJSA1E14FF087599' }]
    const enrichedVehicles = await enrichVehicleData(vehicles)
    console.log('[Test] ✅ VIN enrichment result:', enrichedVehicles[0])
    
    // Test crime risk
    console.log('[Test] 🚨 Testing crime risk...')
    const crimeRisk = await assessCrimeRisk('San Francisco', 'CA')
    console.log('[Test] ✅ Crime risk result:', crimeRisk)
    
    // Test flood risk (using San Francisco coordinates)
    console.log('[Test] 🌊 Testing flood risk...')
    const floodRisk = await assessFloodRisk(37.7749, -122.4194)
    console.log('[Test] ✅ Flood risk result:', floodRisk)
    
    return NextResponse.json({
      success: true,
      results: {
        vehicles: enrichedVehicles,
        crimeRisk,
        floodRisk
      }
    })
    
  } catch (error) {
    console.error('[Test] ❌ Enrichment test failed:', error)
    return NextResponse.json(
      {
        error: 'Enrichment test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
