'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function NewUrlEntry() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Call our API endpoint to scrape the URL
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to scrape URL')
      }

      const data = await response.json()
      
      // Store the scraped data in localStorage to use it in the new entry form
      localStorage.setItem('scrapedData', JSON.stringify(data))
      
      // Redirect to the new entry form
      router.push('/new')
    } catch (error) {
      console.error('Error scraping URL:', error)
      setError('Failed to scrape URL. Please try again or enter the details manually.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Add URL Entry</h1>
          <Link
            href="/"
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back
          </Link>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-300">
                Enter URL
              </label>
              <input
                type="url"
                id="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200 placeholder-slate-400"
                placeholder="https://example.com/recipe"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/"
                className="px-4 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-emerald-800 text-emerald-100 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 