import { NextRequest, NextResponse } from 'next/server'
import { enrichVehicleData, assessCrimeRisk, assessFloodRisk } from '@/lib/enrichment-utils'

async function runEnrichmentTests(testData?: any) {
  // Use provided data or defaults
  const vin = testData?.vin || '5YJSA1E14FF087599'
  const city = testData?.city || 'San Francisco'
  const state = testData?.state || 'CA'
  const latitude = testData?.latitude || 37.7749
  const longitude = testData?.longitude || -122.4194
  
  console.log('[Test] 🧪 Testing enrichment services with:', { vin, city, state, latitude, longitude })
  
  // Test VIN enrichment
  console.log('[Test] 🚗 Testing VIN enrichment...')
  const vehicles = [{ vin }]
  const enrichedVehicles = await enrichVehicleData(vehicles)
  console.log('[Test] ✅ VIN enrichment result:', enrichedVehicles[0])
  
  // Test crime risk
  console.log('[Test] 🚨 Testing crime risk...')
  const crimeRisk = await assessCrimeRisk(city, state)
  console.log('[Test] ✅ Crime risk result:', crimeRisk)
  
  // Test flood risk
  console.log('[Test] 🌊 Testing flood risk...')
  const floodRisk = await assessFloodRisk(latitude, longitude)
  console.log('[Test] ✅ Flood risk result:', floodRisk)
  
  return {
    vehicles: enrichedVehicles,
    crimeRisk,
    floodRisk
  }
}

export async function GET(request: NextRequest) {
  try {
    const results = await runEnrichmentTests()
    
    return NextResponse.json({
      success: true,
      results
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

export async function POST(request: NextRequest) {
  try {
    const testData = await request.json()
    console.log('[Test] 🧪 Testing with custom data:', testData)
    
    const results = await runEnrichmentTests(testData)
    
    return NextResponse.json({
      success: true,
      results
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
