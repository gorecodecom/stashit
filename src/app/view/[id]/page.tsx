'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Entry {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  url?: string;
  tags: string[];
  categories: string[];
  createdAt: string;
}

export default function ViewEntry({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)

  useEffect(() => {
    fetch(`/api/entries/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.entry) {
          setEntry(data.entry)
        } else {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))
  }, [params.id, router])

  if (!entry) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100">{entry.title}</h1>
          <div className="flex space-x-4">
            <Link
              href={`/edit/${entry.id}`}
              className="px-4 py-2 bg-emerald-800 text-emerald-100 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Edit
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-6">
            {entry.imageUrl && (
              <div className="rounded-lg overflow-hidden bg-slate-800 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <div className="bg-slate-800 rounded-lg shadow-lg p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-200 mb-2">Details</h2>
                <p className="text-slate-400">Created on {formattedDate}</p>
              </div>
              {entry.categories?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {entry.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-900/50 text-emerald-100 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {entry.url && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Original Recipe</h3>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 break-all"
                  >
                    {entry.url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Content</h2>
            <div className="prose prose-invert prose-slate max-w-none">
              {entry.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-slate-300 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 