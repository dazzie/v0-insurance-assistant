import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64 for PDF.co API
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    console.log('[PDF Parser] Using PDF.co API to parse PDF...')

    // Use PDF.co free API to extract text
    const pdfcoResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.PDFCO_API_KEY || 'demo', // Use 'demo' for testing
      },
      body: JSON.stringify({
        url: `data:application/pdf;base64,${base64}`,
        inline: true,
        async: false,
      }),
    })

    if (!pdfcoResponse.ok) {
      throw new Error(`PDF.co API error: ${pdfcoResponse.status}`)
    }

    const pdfcoData = await pdfcoResponse.json()

    if (pdfcoData.error) {
      throw new Error(pdfcoData.message || 'PDF.co processing failed')
    }

    console.log('[PDF Parser] Success! Text extracted via PDF.co')

    return NextResponse.json({
      success: true,
      text: pdfcoData.body || '',
      pages: pdfcoData.pageCount || 1,
      info: {
        producer: 'PDF.co API',
      },
    })
  } catch (error) {
    console.error('[PDF Parser] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to parse PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
