import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let directory: string
let entriesFile: string
const original = [{ id: 'first', title: 'One' }, { id: 'second', title: 'Two' }]

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'stashit-route-'))
  mkdirSync(join(directory, 'data'))
  entriesFile = join(directory, 'data', 'entries.json')
  writeFileSync(entriesFile, JSON.stringify(original))
  vi.spyOn(process, 'cwd').mockReturnValue(directory)
  vi.resetModules()
})

afterEach(() => {
  vi.restoreAllMocks()
  rmSync(directory, { recursive: true, force: true })
})

const context = (id: string) => ({ params: Promise.resolve({ id }) })

describe('entry routes with asynchronous Next.js parameters', () => {
  it('reads the selected entry and returns 404 for a missing entry', async () => {
    const { GET } = await import('./route')
    const response = await GET(new Request('http://localhost/api/entries/first'), context('first'))
    expect(await response.json()).toEqual({ entry: original[0] })
    expect((await GET(new Request('http://localhost/api/entries/missing'), context('missing'))).status).toBe(404)
  })

  it('updates only the selected entry and preserves the identifier from the route', async () => {
    const { PUT } = await import('./route')
    const response = await PUT(new Request('http://localhost/api/entries/first', {
      method: 'PUT', body: JSON.stringify({ id: 'changed', title: 'Updated' }),
    }), context('first'))
    expect(response.status).toBe(200)
    expect(JSON.parse(readFileSync(entriesFile, 'utf8'))).toEqual([
      { id: 'first', title: 'Updated' }, original[1],
    ])
  })

  it('deletes only the selected entry and leaves storage unchanged for a missing identifier', async () => {
    const { DELETE } = await import('./route')
    const request = new Request('http://localhost/api/entries/first', { method: 'DELETE' })
    expect((await DELETE(request, context('first'))).status).toBe(200)
    expect((await DELETE(request, context('missing'))).status).toBe(404)
    expect(JSON.parse(readFileSync(entriesFile, 'utf8'))).toEqual([original[1]])
  })
})
