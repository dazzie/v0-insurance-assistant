import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Simple admin endpoint - in production, add proper admin authentication
export async function GET(request: NextRequest) {
  try {
    const DB_DIR = path.join(process.cwd(), '.data')
    const USERS_FILE = path.join(DB_DIR, 'users.json')
    const PROFILES_DIR = path.join(DB_DIR, 'profiles')
    const QUOTES_DIR = path.join(DB_DIR, 'quotes')

    // Load all users
    let users = []
    if (fs.existsSync(USERS_FILE)) {
      const usersData = fs.readFileSync(USERS_FILE, 'utf-8')
      users = JSON.parse(usersData)
    }

    // Load profiles and quotes for each user
    const usersWithData = users.map((user: any) => {
      const userData = {
        ...user,
        profile: null,
        quotes: [],
        profileExists: false,
        quotesExists: false
      }

      // Load profile
      const profilePath = path.join(PROFILES_DIR, `${user.id}.json`)
      if (fs.existsSync(profilePath)) {
        const profileData = fs.readFileSync(profilePath, 'utf-8')
        const profileInfo = JSON.parse(profileData)
        userData.profile = profileInfo.profile
        userData.profileExists = true
        userData.profileUpdatedAt = profileInfo.updatedAt
      }

      // Load quotes
      const quotesPath = path.join(QUOTES_DIR, `${user.id}.json`)
      if (fs.existsSync(quotesPath)) {
        const quotesData = fs.readFileSync(quotesPath, 'utf-8')
        const quotesInfo = JSON.parse(quotesData)
        userData.quotes = quotesInfo.quotes || []
        userData.quotesExists = true
        userData.quotesUpdatedAt = quotesInfo.updatedAt
      }

      return userData
    })

    return NextResponse.json({
      success: true,
      users: usersWithData,
      totalUsers: users.length,
      usersWithProfiles: usersWithData.filter(u => u.profileExists).length,
      usersWithQuotes: usersWithData.filter(u => u.quotesExists).length
    })
  } catch (error) {
    console.error('[Admin] Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Delete user endpoint (for admin cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const DB_DIR = path.join(process.cwd(), '.data')
    const USERS_FILE = path.join(DB_DIR, 'users.json')
    const PROFILES_DIR = path.join(DB_DIR, 'profiles')
    const QUOTES_DIR = path.join(DB_DIR, 'quotes')

    // Remove from users.json
    if (fs.existsSync(USERS_FILE)) {
      const usersData = fs.readFileSync(USERS_FILE, 'utf-8')
      const users = JSON.parse(usersData)
      const filteredUsers = users.filter((u: any) => u.id !== userId)
      fs.writeFileSync(USERS_FILE, JSON.stringify(filteredUsers, null, 2))
    }

    // Remove profile file
    const profilePath = path.join(PROFILES_DIR, `${userId}.json`)
    if (fs.existsSync(profilePath)) {
      fs.unlinkSync(profilePath)
    }

    // Remove quotes file
    const quotesPath = path.join(QUOTES_DIR, `${userId}.json`)
    if (fs.existsSync(quotesPath)) {
      fs.unlinkSync(quotesPath)
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('[Admin] Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
