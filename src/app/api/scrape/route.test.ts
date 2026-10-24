import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

afterEach(() => vi.unstubAllGlobals())

describe('scraping with the updated HTML parser', () => {
  it('preserves extracted metadata, article text, Unicode, and tags', async () => {
    const fetch = vi.fn(async () => new Response(`
      <html><head><title>Fallback</title>
      <meta property="og:title" content="Crème brûlée">
      <meta property="og:image" content="https://example.com/image.png">
      <meta name="keywords" content="dessert, recipe"></head>
      <body><article>Heat the cream. <strong>Add sugar.</strong></article></body></html>
    `))
    vi.stubGlobal('fetch', fetch)
    const response = await POST(new Request('http://localhost/api/scrape', {
      method: 'POST', body: JSON.stringify({ url: 'https://example.com/recipe' }),
    }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      title: 'Crème brûlée', content: 'Heat the cream. Add sugar.',
      imageUrl: 'https://example.com/image.png', url: 'https://example.com/recipe',
      tags: ['dessert', 'recipe'],
    })
    expect(fetch).toHaveBeenCalledWith('https://example.com/recipe')
  })
})
