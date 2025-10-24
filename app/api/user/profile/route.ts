import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { saveUserProfile, loadUserProfile } from '@/lib/db'

// GET /api/user/profile - Load user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = loadUserProfile(session.user.id)
    
    return NextResponse.json({
      success: true,
      profile: profile || null
    })
  } catch (error) {
    console.error('[Profile] Load error:', error)
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    )
  }
}

// POST /api/user/profile - Save user's profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { profile } = await request.json()
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      )
    }

    saveUserProfile(session.user.id, profile)
    
    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully'
    })
  } catch (error) {
    console.error('[Profile] Save error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}

