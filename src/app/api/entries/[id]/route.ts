import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

const ENTRIES_FILE = join(process.cwd(), 'data', 'entries.json')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entries = JSON.parse(readFileSync(ENTRIES_FILE, 'utf-8'))
    const entry = entries.find((e: any) => e.id === params.id)
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ entry })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entries = JSON.parse(readFileSync(ENTRIES_FILE, 'utf-8'))
    const updatedEntry = await request.json()
    const index = entries.findIndex((e: any) => e.id === params.id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    entries[index] = {
      ...entries[index],
      ...updatedEntry,
      id: params.id, // Ensure ID doesn't change
    }

    writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entries = JSON.parse(readFileSync(ENTRIES_FILE, 'utf-8'))
    const newEntries = entries.filter((e: any) => e.id !== params.id)

    if (newEntries.length === entries.length) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    writeFileSync(ENTRIES_FILE, JSON.stringify(newEntries, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
} 