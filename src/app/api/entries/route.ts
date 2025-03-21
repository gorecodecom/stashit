import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const ENTRIES_FILE = join(DATA_DIR, 'entries.json')

// Ensure data directory exists
try {
  mkdirSync(DATA_DIR, { recursive: true })
} catch (error) {
  console.error('Error creating data directory:', error)
}

// Initialize entries file if it doesn't exist
try {
  readFileSync(ENTRIES_FILE)
} catch (error) {
  writeFileSync(ENTRIES_FILE, '[]', 'utf-8')
}

export async function GET() {
  try {
    const entries = JSON.parse(readFileSync(ENTRIES_FILE, 'utf-8'))
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error reading entries:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newEntry = await request.json()
    const entries = JSON.parse(readFileSync(ENTRIES_FILE, 'utf-8'))
    
    entries.unshift(newEntry) // Add new entry at the beginning
    writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving entry:', error)
    return NextResponse.json(
      { error: 'Failed to save entry' },
      { status: 500 }
    )
  }
} 