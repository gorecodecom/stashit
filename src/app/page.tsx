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
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Get unique categories from entries
  const categories = [...new Set(entries.flatMap(entry => entry.categories || []))].sort()

  // Handle URL hash for entry selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashChange = () => {
        const hash = window.location.hash.slice(1) // Remove the # symbol
        if (hash && entries.length > 0) {
          const entry = entries.find(e => e.id === hash)
          if (entry) {
            setSelectedEntry(entry)
            setIsSidebarOpen(false) // Close sidebar on mobile when entry is selected
          }
        }
      }

      // Listen for hash changes
      window.addEventListener('hashchange', handleHashChange)
      // Check hash on initial load
      handleHashChange()

      return () => {
        window.removeEventListener('hashchange', handleHashChange)
      }
    }
  }, [entries])

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

  // Filter entries based on selected category and search query
  const filteredEntries = entries
    .filter(entry => !selectedCategory || entry.categories?.includes(selectedCategory))
    .filter(entry => 
      !searchQuery || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => a.title.localeCompare(b.title))

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
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-200 hover:bg-slate-700 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-emerald-100">StashIt</h1>
        <div className="w-6"></div>
      </div>

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 md:min-w-[20rem] border-r border-slate-700 bg-slate-800 overflow-y-auto flex-shrink-0 h-[calc(100vh-4rem)] md:h-screen z-10`}>
        <div className="sticky top-0 p-4 border-b border-slate-700 bg-slate-900">
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
                onClick={() => {
                  setSelectedEntry(entry)
                  setIsSidebarOpen(false) // Close sidebar on mobile when entry is selected
                }}
              >
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/edit/${entry.id}`}
                    className="px-2 py-1 text-xs bg-emerald-900/50 text-emerald-100 rounded-md hover:bg-emerald-800/50 mr-2"
                    onClick={e => e.stopPropagation()}
                    title="Edit this entry"
                  >
                    Edit
                  </Link>
                  <button
                    className="px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(entry.id)
                    }}
                    title="Delete this entry"
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
      <main className="flex-1 overflow-y-auto bg-slate-800 h-[calc(100vh-4rem)] md:h-screen">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-center mb-8 relative">
            <div className="w-full md:w-80 md:absolute md:right-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-slate-200 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="hidden md:block w-full">
              <h1 className="text-4xl font-bold text-emerald-100 text-center">StashIt</h1>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-4 mb-6">
            <Link 
              href="/new-url"
              className="w-full md:w-auto px-4 py-2 bg-emerald-800 text-emerald-100 rounded-lg hover:bg-emerald-700 transition-colors text-center"
              title="Add a new entry from a URL"
            >
              Add URL Entry
            </Link>
            <Link 
              href="/new"
              className="w-full md:w-auto px-4 py-2 bg-emerald-800 text-emerald-100 rounded-lg hover:bg-emerald-700 transition-colors text-center"
              title="Create a new entry manually"
            >
              Add New Entry
            </Link>
          </div>
          {/* Entry Content */}
          {selectedEntry ? (
            <div className="bg-slate-900 rounded-lg p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-100">{selectedEntry.title}</h2>
                <div className="flex gap-2">
                  <Link
                    href={`/edit/${selectedEntry.id}`}
                    className="p-2 text-slate-300 hover:text-emerald-100 transition-colors"
                    title="Edit entry"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 text-slate-300 hover:text-slate-100 transition-colors"
                    title="Close entry"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start gap-4 mb-4">
                {selectedEntry.imageUrl && (
                  <div className="w-full md:w-auto h-[200px] md:h-[300px] rounded-xl overflow-hidden bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedEntry.imageUrl}
                      alt=""
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <p className="text-sm sm:text-base text-slate-300 whitespace-pre-wrap">{selectedEntry.content}</p>
                  {selectedEntry.url && (
                    <a
                      href={selectedEntry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-emerald-400 hover:text-emerald-300"
                    >
                      View Original Source →
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedEntry.categories?.map((category, index) => (
                  <span
                    key={`cat-${index}`}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
                {selectedEntry.tags.map((tag, index) => (
                  <span
                    key={`tag-${index}`}
                    className="px-3 py-1 bg-emerald-900/50 text-emerald-100 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 p-8">
              Select an entry to view its details
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
