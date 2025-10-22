import { NextRequest, NextResponse } from 'next/server'
import { enrichVehicleData, enrichAddressData, assessFloodRisk, assessCrimeRisk, assessEarthquakeRisk, assessWildfireRisk } from '@/lib/enrichment-utils'

export async function POST(request: NextRequest) {
  try {
    const { coverage, customerProfile } = await request.json()
    
    if (!coverage) {
      return NextResponse.json(
        { error: 'No coverage data provided' },
        { status: 400 }
      )
    }

    console.log('[Enrich] 🚀 Starting streaming enrichment...')
    const startTime = Date.now()
    
    // ⚡ Create streaming response
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        
        // Send initial status
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'status',
          message: '🚀 Starting enrichment process...',
          timestamp: Date.now()
        })}\n\n`))
      },
      
      async pull(controller) {
        const encoder = new TextEncoder()
        const enrichedCoverage = { ...coverage }
        const enrichmentSummary = {
          vehiclesEnriched: false,
          addressEnriched: false,
          floodRiskAssessed: false,
          crimeRiskAssessed: false,
          earthquakeRiskAssessed: false,
          wildfireRiskAssessed: false,
        }

        try {
          // 🚗 Vehicle enrichment (if vehicles exist)
          if (enrichedCoverage.vehicles && Array.isArray(enrichedCoverage.vehicles) && enrichedCoverage.vehicles.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              step: 'vehicles',
              message: '🚗 Enriching vehicle data with NHTSA...',
              timestamp: Date.now()
            })}\n\n`))
            
            try {
              console.log('[Enrich] 🚗 Enriching vehicles...')
              enrichedCoverage.vehicles = await enrichVehicleData(enrichedCoverage.vehicles)
              enrichmentSummary.vehiclesEnriched = enrichedCoverage.vehicles.some(v => v.enriched)
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                step: 'vehicles',
                message: '✅ Vehicle data enriched',
                success: true,
                timestamp: Date.now()
              })}\n\n`))
            } catch (error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                step: 'vehicles',
                message: '⚠️ Vehicle enrichment failed',
                success: false,
                timestamp: Date.now()
              })}\n\n`))
            }
          }

          // 🏠 Address enrichment (if address data exists)
          if (enrichedCoverage.address || (enrichedCoverage.city && enrichedCoverage.state)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              step: 'address',
              message: '🏠 Geocoding address...',
              timestamp: Date.now()
            })}\n\n`))
            
            try {
              console.log('[Enrich] 🏠 Enriching address...')
              const addressEnrichment = await enrichAddressData(
                enrichedCoverage.address || '',
                enrichedCoverage.city || '',
                enrichedCoverage.state || '',
                enrichedCoverage.zipCode || ''
              )
              
                  if (addressEnrichment) {
                    enrichedCoverage.addressEnrichment = addressEnrichment
                    enrichmentSummary.addressEnriched = true
                    
                    // Debug: Log what coordinates we got from address enrichment
                    console.log('[Enrich] 🏠 Address enrichment result:', {
                      hasLatitude: !!addressEnrichment.latitude,
                      hasLongitude: !!addressEnrichment.longitude,
                      latitude: addressEnrichment.latitude,
                      longitude: addressEnrichment.longitude
                    })
                    
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'progress',
                      step: 'address',
                      message: '✅ Address geocoded',
                      success: true,
                      timestamp: Date.now()
                    })}\n\n`))

                // 🌊 Flood risk assessment (if we have coordinates from address enrichment)
                if (addressEnrichment?.latitude && addressEnrichment?.longitude) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'progress',
                    step: 'flood',
                    message: '🌊 Assessing flood risk from address...',
                    timestamp: Date.now()
                  })}\n\n`))
                  
                  try {
                    const floodRisk = await assessFloodRisk(
                      addressEnrichment.latitude,
                      addressEnrichment.longitude
                    )
                    if (floodRisk) {
                      enrichedCoverage.riskAssessment = enrichedCoverage.riskAssessment || {}
                      enrichedCoverage.riskAssessment.floodRisk = floodRisk
                      enrichmentSummary.floodRiskAssessed = true
                      
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'progress',
                        step: 'flood',
                        message: '✅ Flood risk assessed',
                        success: true,
                        timestamp: Date.now()
                      })}\n\n`))
                    }
                  } catch (error) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'progress',
                      step: 'flood',
                      message: '⚠️ Flood risk assessment failed',
                      success: false,
                      timestamp: Date.now()
                    })}\n\n`))
                  }
                }
              }
            } catch (error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                step: 'address',
                message: '⚠️ Address enrichment failed',
                success: false,
                timestamp: Date.now()
              })}\n\n`))
            }
          }

          // Debug: Log customer profile coordinates
          console.log('[Enrich] 👤 Customer profile coordinates:', {
            hasLatitude: !!customerProfile?.latitude,
            hasLongitude: !!customerProfile?.longitude,
            latitude: customerProfile?.latitude,
            longitude: customerProfile?.longitude
          })

          // 🌊 Flood risk assessment (always try to run)
          const hasProfileCoords = customerProfile?.latitude && customerProfile?.longitude
          const hasAddressCoords = enrichedCoverage.addressEnrichment?.latitude && enrichedCoverage.addressEnrichment?.longitude
          
          let lat, lng
          if (hasProfileCoords || hasAddressCoords) {
            lat = customerProfile?.latitude || enrichedCoverage.addressEnrichment?.latitude
            lng = customerProfile?.longitude || enrichedCoverage.addressEnrichment?.longitude
          } else {
            // Fallback to San Francisco coordinates for testing
            console.log('[Enrich] ⚠️ No coordinates available, using San Francisco fallback')
            lat = 37.7749
            lng = -122.4194
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            step: 'flood',
            message: '🌊 Assessing flood risk...',
            timestamp: Date.now()
          })}\n\n`))
            
            try {
              const floodRisk = await assessFloodRisk(lat, lng)
              if (floodRisk) {
                enrichedCoverage.riskAssessment = enrichedCoverage.riskAssessment || {}
                enrichedCoverage.riskAssessment.floodRisk = floodRisk
                enrichmentSummary.floodRiskAssessed = true
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  step: 'flood',
                  message: '✅ Flood risk assessed',
                  success: true,
                  timestamp: Date.now()
                })}\n\n`))
              }
            } catch (error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                step: 'flood',
                message: '⚠️ Flood risk assessment failed',
                success: false,
                timestamp: Date.now()
              })}\n\n`))
            }

          // 🚨 Crime risk assessment (always try if we have location data)
          if (enrichedCoverage.city || enrichedCoverage.state || customerProfile?.state) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              step: 'crime',
              message: '🚨 Assessing crime risk...',
              timestamp: Date.now()
            })}\n\n`))
            
            try {
              const crimeRisk = await assessCrimeRisk(
                enrichedCoverage.city || customerProfile?.city || '',
                enrichedCoverage.state || customerProfile?.state || ''
              )
              if (crimeRisk) {
                enrichedCoverage.riskAssessment = enrichedCoverage.riskAssessment || {}
                enrichedCoverage.riskAssessment.crimeRisk = crimeRisk
                enrichmentSummary.crimeRiskAssessed = true
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  step: 'crime',
                  message: '✅ Crime risk assessed',
                  success: true,
                  timestamp: Date.now()
                })}\n\n`))
              }
            } catch (error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                step: 'crime',
                message: '⚠️ Crime risk assessment failed',
                success: false,
                timestamp: Date.now()
              })}\n\n`))
            }
          }

          // 🏚️ Earthquake risk assessment (always try to run)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            step: 'earthquake',
            message: '🏚️ Assessing earthquake risk...',
            timestamp: Date.now()
          })}\n\n`))
          
          try {
            const earthquakeRisk = await assessEarthquakeRisk(
              lat,
              lng,
              enrichedCoverage.state || customerProfile?.state || ''
            )
              if (earthquakeRisk) {
                enrichedCoverage.riskAssessment = enrichedCoverage.riskAssessment || {}
                enrichedCoverage.riskAssessment.earthquakeRisk = earthquakeRisk
                enrichmentSummary.earthquakeRiskAssessed = true
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  step: 'earthquake',
                  message: '✅ Earthquake risk assessed',
                  success: true,
                  timestamp: Date.now()
                })}\n\n`))
              }
            } catch (error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                step: 'earthquake',
                message: '⚠️ Earthquake risk assessment failed',
                success: false,
                timestamp: Date.now()
              })}\n\n`))
            }

          // 🔥 Wildfire risk assessment (always try to run)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            step: 'wildfire',
            message: '🔥 Assessing wildfire risk...',
            timestamp: Date.now()
          })}\n\n`))
          
          try {
            const wildfireRisk = await assessWildfireRisk(
              lat,
              lng,
              enrichedCoverage.state || customerProfile?.state || ''
            )
              if (wildfireRisk) {
                enrichedCoverage.riskAssessment = enrichedCoverage.riskAssessment || {}
                enrichedCoverage.riskAssessment.wildfireRisk = wildfireRisk
                enrichmentSummary.wildfireRiskAssessed = true
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  step: 'wildfire',
                  message: '✅ Wildfire risk assessed',
                  success: true,
                  timestamp: Date.now()
                })}\n\n`))
              }
            } catch (error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                step: 'wildfire',
                message: '⚠️ Wildfire risk assessment failed',
                success: false,
                timestamp: Date.now()
              })}\n\n`))
            }

          // Send final completion
          const duration = Date.now() - startTime
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            coverage: enrichedCoverage,
            enrichmentSummary,
            message: `✅ Enrichment complete in ${duration}ms`,
            duration,
            timestamp: Date.now()
          })}\n\n`))
          
          controller.close()
          
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: '❌ Enrichment failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('[Enrich] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to enrich coverage data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}