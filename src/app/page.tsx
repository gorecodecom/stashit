'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Entry {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  url?: string;
  tags: string[];
  categories: string[];
  createdAt: string;
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Get unique categories from entries
  const categories = [...new Set(entries.flatMap(entry => entry.categories || []))].sort()

  // Filter entries based on selected category
  const filteredEntries = selectedCategory
    ? entries.filter(entry => entry.categories?.includes(selectedCategory))
    : entries

  useEffect(() => {
    fetch('/api/entries')
      .then(res => res.json())
      .then(data => {
        setEntries(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching entries:', error)
        setIsLoading(false)
      })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/entries/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete entry')
      }

      setEntries(entries.filter(entry => entry.id !== id))
      if (selectedEntry?.id === id) {
        setSelectedEntry(null)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry. Please try again.')
    }
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-700 bg-slate-800 overflow-y-auto">
        <div className="p-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-emerald-100">My Entries</h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 bg-slate-700 text-slate-200 rounded-md px-2 py-1 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option key="all" value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={`category-${index}-${category}`} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Clear filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="divide-y divide-slate-700">
          {isLoading ? (
            <div className="p-4 text-slate-400 text-center">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="p-4 text-slate-400 text-center">
              No entries yet. Create your first one!
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="group relative p-4 hover:bg-slate-800/50 cursor-pointer"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/edit/${entry.id}`}
                    className="px-2 py-1 text-xs bg-emerald-900/50 text-emerald-100 rounded-md hover:bg-emerald-800/50 mr-2"
                    onClick={e => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    className="px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(entry.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div className="flex items-start gap-4">
                  {entry.imageUrl && (
                    <div className="flex-shrink-0 w-auto h-[50px] rounded-xl overflow-hidden bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.imageUrl}
                        alt=""
                        className="w-auto h-full object-contain rounded-xl"
                      />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-slate-200 font-medium truncate">{entry.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{entry.content}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.categories?.map((category, index) => (
                        <span
                          key={`cat-${index}`}
                          className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs"
                        >
                          {category}
                        </span>
                      ))}
                      {entry.tags.length > 0 && entry.tags.map((tag, index) => (
                        <span
                          key={`tag-${index}`}
                          className="px-2 py-1 bg-emerald-900/50 text-emerald-100 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-800">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-100 text-center">Stashit - Your Personal Information Manager</h1>
          </div>
          <div className="flex justify-end mb-6 space-x-4">
            <Link 
              href="/new-url"
              className="px-4 py-2 bg-emerald-800 text-emerald-100 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add URL Entry
            </Link>
            <Link 
              href="/new"
              className="px-4 py-2 bg-emerald-800 text-emerald-100 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add New Entry
            </Link>
          </div>

          <div className="bg-slate-900 rounded-lg shadow-lg">
            {selectedEntry ? (
              <>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-100">
                        {selectedEntry.title}
                      </h1>
                      {selectedEntry.categories?.[0] && (
                        <div className="mt-1">
                          <span className="text-slate-400">Category: </span>
                          <span className="text-slate-300">{selectedEntry.categories[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      <Link
                        href={`/edit/${selectedEntry.id}`}
                        className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {selectedEntry.imageUrl && (
                    <div className="rounded-xl overflow-hidden h-[250px] bg-slate-800 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={selectedEntry.imageUrl} 
                        alt={selectedEntry.title}
                        className="w-auto h-full object-contain mx-auto rounded-xl p-2"
                      />
                    </div>
                  )}
                  <div className="space-y-6 mt-6">
                    {selectedEntry.url && (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-2">Original Source</h3>
                        <a
                          href={selectedEntry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 break-all"
                        >
                          {selectedEntry.url}
                        </a>
                      </div>
                    )}
                    <div className="prose max-w-none">
                      <p className="text-slate-300 whitespace-pre-wrap">
                        {selectedEntry.content}
                      </p>
                    </div>
                    {selectedEntry.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-300 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.tags.map((tag, index) => (
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
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-200 mb-4">Welcome!</h2>
                  <div className="prose max-w-none">
                    <p className="text-slate-400">
                      Select an entry from the sidebar to view its details, or create a new entry using the button above.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
