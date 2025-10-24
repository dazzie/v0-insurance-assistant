import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { saveUserQuotes, loadUserQuotes, addUserQuote } from '@/lib/db'

// GET /api/user/quotes - Load user's quotes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const quotes = loadUserQuotes(session.user.id)
    
    return NextResponse.json({
      success: true,
      quotes: quotes || []
    })
  } catch (error) {
    console.error('[Quotes] Load error:', error)
    return NextResponse.json(
      { error: 'Failed to load quotes' },
      { status: 500 }
    )
  }
}

// POST /api/user/quotes - Add a new quote
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { quote } = await request.json()
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote data is required' },
        { status: 400 }
      )
    }

    addUserQuote(session.user.id, quote)
    
    return NextResponse.json({
      success: true,
      message: 'Quote saved successfully'
    })
  } catch (error) {
    console.error('[Quotes] Save error:', error)
    return NextResponse.json(
      { error: 'Failed to save quote' },
      { status: 500 }
    )
  }
}

