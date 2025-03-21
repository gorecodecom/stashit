import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    // Fetch the webpage
    const response = await fetch(url)
    const html = await response.text()
    
    // Parse the HTML
    const $ = cheerio.load(html)
    
    // Extract data
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 
                 ''
                        
    const imageUrl = $('meta[property="og:image"]').attr('content') || 
                    $('meta[property="twitter:image"]').attr('content') || 
                    ''

    // Try to extract article content if available
    let content = ''
    // Look for common article content containers
    const articleSelectors = ['article', '.article-content', '.post-content', '.content', 'main']
    for (const selector of articleSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        content = element.text().trim()
        break
      }
    }

    // If no content found in common containers, take the first few paragraphs
    if (!content) {
      content = $('p').slice(0, 3).map((_, el) => $(el).text().trim()).get().join('\n\n')
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim()

    // Extract potential tags from meta keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content') || ''
    const tags = metaKeywords
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    return NextResponse.json({
      title,
      content,
      imageUrl,
      url,
      tags
    })
  } catch (error) {
    console.error('Error scraping URL:', error)
    return NextResponse.json(
      { error: 'Failed to scrape URL' },
      { status: 500 }
    )
  }
} 