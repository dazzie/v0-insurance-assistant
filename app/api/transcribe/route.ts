import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio')

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    console.log('[Transcribe] Received audio file:', audioFile.type, audioFile.size, 'bytes')
    console.log('[Transcribe] Sending to OpenAI Whisper API...')

    // Pass the blob directly to OpenAI - it accepts Blob/File objects
    // Cast as any to avoid TypeScript issues with File type
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile as any,
      model: 'whisper-1',
      language: 'en', // Optimize for English
      response_format: 'json',
    })

    console.log('[Transcribe] Transcription complete:', transcription.text)

    return NextResponse.json({
      text: transcription.text,
      duration: transcription.duration || null,
    })
  } catch (error: any) {
    console.error('[Transcribe] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    )
  }
}

