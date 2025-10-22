/**
 * 🚀 Enrichment Utilities
 * Reusable functions for data enrichment
 */

import { spawn } from 'child_process'
import path from 'path'

/**
 * Call MCP server for enrichment with timeout
 */
async function callMCPServer(
  serverPath: string,
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const serverIndexPath = path.join(process.cwd(), serverPath, 'index.js')
    
    const child = spawn('node', [serverIndexPath], {
      cwd: path.join(process.cwd(), serverPath),
    })

    let stdout = ''
    let stderr = ''
    let isResolved = false

    // ⚡ Add 15-second timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true
        child.kill('SIGTERM')
        reject(new Error(`MCP server timeout after 15 seconds for ${toolName}`))
      }
    }, 15000)

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (isResolved) return
      isResolved = true
      clearTimeout(timeout)

      if (code !== 0) {
        console.error(`[MCP] Server exited with code ${code}`)
        console.error(`[MCP] stderr:`, stderr)
        reject(new Error(`MCP server failed with code ${code}`))
        return
      }

      try {
        // Parse the JSON-RPC response
        const lines = stdout.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const response = JSON.parse(line)
            if (response.result && response.result.content) {
              const content = response.result.content[0]
              if (content.type === 'text') {
                const data = JSON.parse(content.text)
                resolve({ success: true, data })
                return
              }
            }
          } catch (e) {
            // Skip non-JSON lines
            continue
          }
        }
        
        reject(new Error('No valid JSON response found'))
      } catch (error) {
        console.error('[MCP] Failed to parse response:', error)
        reject(error)
      }
    })

    child.on('error', (error) => {
      if (isResolved) return
      isResolved = true
      clearTimeout(timeout)
      reject(error)
    })

    // Send the JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }

    child.stdin.write(JSON.stringify(request) + '\n')
    child.stdin.end()
  })
}

/**
 * Enrich vehicle data with NHTSA VIN decoder
 */
export async function enrichVehicleData(vehicles: any[]): Promise<any[]> {
  const enrichedVehicles = await Promise.all(
    vehicles.map(async (vehicle) => {
      if (!vehicle.vin) {
        return vehicle
      }

      try {
        console.log(`[Enrich] Decoding VIN: ${vehicle.vin}`)
        
        // Try MCP server first
        let vinData
        try {
          vinData = await callMCPServer(
            'mcp-server/nhtsa-server',
            'decode_vin',
            { vin: vehicle.vin }
          )
        } catch (mcpError) {
          console.log('[Enrich] ⚠️ MCP server failed, trying direct API...')
          
          // Fallback to direct NHTSA API call
          const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vehicle.vin}?format=json`)
          if (response.ok) {
            const data = await response.json()
            vinData = { success: true, data: data }
          } else {
            throw new Error(`NHTSA API error: ${response.status}`)
          }
        }

        if (vinData.success) {
          return {
            ...vehicle,
            ...vinData.data,
            enriched: true,
            enrichmentSource: 'NHTSA VIN Decoder'
          }
        } else {
          return {
            ...vehicle,
            enrichmentError: vinData.error,
            enriched: false,
            enrichmentSource: 'NHTSA (Error)'
          }
        }
      } catch (error) {
        console.error(`[Enrich] Error enriching vehicle:`, error)
        return {
          ...vehicle,
          enrichmentError: error instanceof Error ? error.message : 'Unknown error',
          enriched: false,
          enrichmentSource: 'Error'
        }
      }
    })
  )

  return enrichedVehicles
}

/**
 * Enrich address data with OpenCage geocoding
 */
export async function enrichAddressData(address: string, city: string, state: string, zipCode: string): Promise<any> {
  try {
    console.log(`[Enrich] Geocoding address: ${address}, ${city}, ${state} ${zipCode}`)
    const geocodeData = await callMCPServer(
      'mcp-server/opencage-server',
      'geocode_address',
      { address, city, state, zipCode }
    )

    if (geocodeData.success) {
      return {
        ...geocodeData.data,
        enriched: true,
        enrichmentSource: 'OpenCage Geocoding'
      }
    } else {
      return {
        enriched: false,
        enrichmentError: geocodeData.error,
        enrichmentSource: 'OpenCage (Error)'
      }
    }
  } catch (error) {
    console.error(`[Enrich] Address enrichment error:`, error)
    return {
      enriched: false,
      enrichmentError: error instanceof Error ? error.message : 'Unknown error',
      enrichmentSource: 'Error'
    }
  }
}

/**
 * Assess flood risk using First Street Foundation
 */
export async function assessFloodRisk(latitude: number, longitude: number): Promise<any> {
  try {
    console.log(`[Enrich] Assessing flood risk for coordinates: ${latitude}, ${longitude}`)
    
    // Try MCP server first
    let floodData
    try {
      floodData = await callMCPServer(
        'mcp-server/fema-server',
        'check_flood_zone',
        { latitude, longitude }
      )
    } catch (mcpError) {
      console.log('[Enrich] ⚠️ MCP server failed, using mock data...')
      
      // Fallback to mock data based on coordinates
      const mockFloodData = {
        success: true,
        data: {
          floodFactor: 3,
          riskLevel: 'Moderate',
          description: `Flood risk assessment for coordinates ${latitude}, ${longitude}`,
          floodInsuranceRequired: false,
          enrichmentSource: 'Mock Data (MCP Server Unavailable)',
          enrichmentDate: new Date().toISOString()
        }
      }
      floodData = mockFloodData
    }

    if (floodData.success) {
      return floodData.data
    } else {
      return null
    }
  } catch (error) {
    console.error(`[Enrich] Flood risk assessment error:`, error)
    return null
  }
}

/**
 * Assess crime risk using FBI data
 */
export async function assessCrimeRisk(city: string, state: string): Promise<any> {
  try {
    console.log(`[Enrich] Assessing crime risk for: ${city}, ${state}`)
    
    // Try MCP server first
    let crimeData
    try {
      crimeData = await callMCPServer(
        'mcp-server/fbi-crime-server',
        'assess_crime_risk',
        { city, state }
      )
    } catch (mcpError) {
      console.log('[Enrich] ⚠️ MCP server failed, using mock data...')
      
      // Fallback to mock data based on city/state
      const mockCrimeData = {
        success: true,
        data: {
          crimeIndex: city.toLowerCase().includes('san francisco') ? 75 : 50,
          riskLevel: city.toLowerCase().includes('san francisco') ? 'High' : 'Moderate',
          description: `Crime risk assessment for ${city}, ${state}`,
          enrichmentSource: 'Mock Data (MCP Server Unavailable)',
          enrichmentDate: new Date().toISOString()
        }
      }
      crimeData = mockCrimeData
    }

    if (crimeData.success) {
      return crimeData.data
    } else {
      return null
    }
  } catch (error) {
    console.error(`[Enrich] Crime risk assessment error:`, error)
    return null
  }
}

/**
 * Assess earthquake risk using USGS data
 */
export async function assessEarthquakeRisk(latitude: number, longitude: number, state: string): Promise<any> {
  try {
    console.log(`[Enrich] Assessing earthquake risk for: ${latitude}, ${longitude}, ${state}`)
    const earthquakeData = await callMCPServer(
      'mcp-server/usgs-earthquake-server',
      'assess_earthquake_risk',
      { latitude, longitude, state }
    )

    if (earthquakeData.success) {
      return earthquakeData.data
    } else {
      return null
    }
  } catch (error) {
    console.error(`[Enrich] Earthquake risk assessment error:`, error)
    return null
  }
}

/**
 * Assess wildfire risk using USGS data
 */
export async function assessWildfireRisk(latitude: number, longitude: number, state: string): Promise<any> {
  try {
    console.log(`[Enrich] Assessing wildfire risk for: ${latitude}, ${longitude}, ${state}`)
    const wildfireData = await callMCPServer(
      'mcp-server/usgs-wildfire-server',
      'assess_wildfire_risk',
      { latitude, longitude, state }
    )

    if (wildfireData.success) {
      return wildfireData.data
    } else {
      return null
    }
  } catch (error) {
    console.error(`[Enrich] Wildfire risk assessment error:`, error)
    return null
  }
}
