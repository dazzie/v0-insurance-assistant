import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, format = 'base64' } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // For now, we'll use a mock implementation
    // In production, this would call the MCP server's extract-text-from-image tool
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock extracted text - in production, this would come from the MCP server
    const mockExtractedText = `
      PROGRESSIVE INSURANCE COMPANY
      Policy Number: ABC123456789
      Effective Date: 01/15/2024
      Expiration Date: 01/15/2025
      
      Named Insured: John Brenna
      Address: 1234 Market Street, Apt 5B, San Francisco, CA 94102
      
      Vehicle Information:
      Year: 2018
      Make: Tesla
      Model: Model 3
      VIN: 5YJ3E1EA8JF000123
      
      Coverage Details:
      Bodily Injury Liability: $100,000/$300,000
      Property Damage Liability: $50,000
      Comprehensive Deductible: $1,000
      Collision Deductible: $1,000
      
      Premium: $1,573.75
      Payment Method: Monthly
    `
    
    return NextResponse.json({
      text: mockExtractedText.trim(),
      confidence: 0.95,
      metadata: {
        processingTime: 2000,
        imageSize: { width: 1920, height: 1080 }
      }
    })

    // TODO: Implement actual MCP server integration
    // const mcpResponse = await fetch('http://localhost:3001/extract-text', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     image,
    //     format
    //   })
    // })
    // 
    // if (!mcpResponse.ok) {
    //   throw new Error('MCP server error')
    // }
    // 
    // const result = await mcpResponse.json()
    // return NextResponse.json(result)

  } catch (error) {
    console.error('Text extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from image' },
      { status: 500 }
    )
  }
}

