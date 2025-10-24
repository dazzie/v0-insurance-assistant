/**
 * Simple file-based database for user data
 * Uses JSON files for storage (can be upgraded to SQL database later)
 */

import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

const DB_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DB_DIR, 'users.json')
const PROFILES_DIR = path.join(DB_DIR, 'profiles')
const QUOTES_DIR = path.join(DB_DIR, 'quotes')

// Ensure directories exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}
if (!fs.existsSync(PROFILES_DIR)) {
  fs.mkdirSync(PROFILES_DIR, { recursive: true })
}
if (!fs.existsSync(QUOTES_DIR)) {
  fs.mkdirSync(QUOTES_DIR, { recursive: true })
}

export interface User {
  id: string
  email: string
  passwordHash: string
  name?: string
  createdAt: string
  lastLogin?: string
}

export interface UserProfile {
  userId: string
  profile: any // CustomerProfile type
  updatedAt: string
}

export interface UserQuotes {
  userId: string
  quotes: any[]
  updatedAt: string
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

function loadUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) {
    return []
  }
  const data = fs.readFileSync(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const users = loadUsers()
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists')
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)
  
  // Create new user
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    passwordHash,
    name,
    createdAt: new Date().toISOString()
  }
  
  users.push(user)
  saveUsers(users)
  
  return user
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const users = loadUsers()
  const user = users.find(u => u.email === email)
  
  if (!user) {
    return null
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return null
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString()
  saveUsers(users)
  
  return user
}

export function getUserById(id: string): User | null {
  const users = loadUsers()
  return users.find(u => u.id === id) || null
}

export function getUserByEmail(email: string): User | null {
  const users = loadUsers()
  return users.find(u => u.email === email) || null
}

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

export function saveUserProfile(userId: string, profile: any): void {
  const profileData: UserProfile = {
    userId,
    profile,
    updatedAt: new Date().toISOString()
  }
  
  const filePath = path.join(PROFILES_DIR, `${userId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2))
}

export function loadUserProfile(userId: string): any | null {
  const filePath = path.join(PROFILES_DIR, `${userId}.json`)
  
  if (!fs.existsSync(filePath)) {
    return null
  }
  
  const data = fs.readFileSync(filePath, 'utf-8')
  const profileData: UserProfile = JSON.parse(data)
  return profileData.profile
}

// ============================================================================
// QUOTES MANAGEMENT
// ============================================================================

export function saveUserQuotes(userId: string, quotes: any[]): void {
  const quotesData: UserQuotes = {
    userId,
    quotes,
    updatedAt: new Date().toISOString()
  }
  
  const filePath = path.join(QUOTES_DIR, `${userId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(quotesData, null, 2))
}

export function loadUserQuotes(userId: string): any[] | null {
  const filePath = path.join(QUOTES_DIR, `${userId}.json`)
  
  if (!fs.existsSync(filePath)) {
    return null
  }
  
  const data = fs.readFileSync(filePath, 'utf-8')
  const quotesData: UserQuotes = JSON.parse(data)
  return quotesData.quotes
}

export function addUserQuote(userId: string, quote: any): void {
  const existingQuotes = loadUserQuotes(userId) || []
  existingQuotes.push({
    ...quote,
    id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  })
  saveUserQuotes(userId, existingQuotes)
}

