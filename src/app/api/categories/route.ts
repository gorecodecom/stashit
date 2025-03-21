import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const CATEGORIES_FILE = join(DATA_DIR, 'categories.json')

// Ensure data directory exists
try {
  mkdirSync(DATA_DIR, { recursive: true })
} catch (error) {
  console.error('Error creating data directory:', error)
}

// Initialize categories file if it doesn't exist
try {
  readFileSync(CATEGORIES_FILE)
} catch (error) {
  writeFileSync(CATEGORIES_FILE, '[]', 'utf-8')
}

export async function GET() {
  try {
    const categories = JSON.parse(readFileSync(CATEGORIES_FILE, 'utf-8'))
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error reading categories:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const categories = JSON.parse(readFileSync(CATEGORIES_FILE, 'utf-8'))
    
    // Check if category already exists
    if (categories.includes(name.trim())) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      )
    }
    
    // Add new category
    categories.push(name.trim())
    writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Error saving category:', error)
    return NextResponse.json(
      { error: 'Failed to save category' },
      { status: 500 }
    )
  }
} 