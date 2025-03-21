'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useRef, useEffect } from 'react'

interface ScrapedData {
  title: string
  content: string
  imageUrl: string
  url: string
  tags: string[]
}

export default function NewEntry() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    url: '',
    tags: ''
  })

  useEffect(() => {
    // Check for scraped data in localStorage
    const scrapedDataStr = localStorage.getItem('scrapedData')
    if (scrapedDataStr) {
      try {
        const scrapedData: ScrapedData = JSON.parse(scrapedDataStr)
        setFormData({
          title: scrapedData.title || '',
          content: scrapedData.content || '',
          imageUrl: scrapedData.imageUrl || '',
          url: scrapedData.url || '',
          tags: scrapedData.tags?.join(', ') || ''
        })
        if (scrapedData.imageUrl) {
          setImagePreview(scrapedData.imageUrl)
        }
      } catch (error) {
        console.error('Error parsing scraped data:', error)
      }
      // Clear the scraped data from localStorage
      localStorage.removeItem('scrapedData')
    }

    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data)
      })
      .catch(error => {
        console.error('Error fetching categories:', error)
      })
  }, [])

  const handleAddCategory = async (categoryName: string) => {
    if (!categoryName.trim()) return

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: categoryName.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to add category')
        return
      }

      const data = await response.json()
      setCategories(data.categories)
      setNewCategory('')
      setIsAddingCategory(false)
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formDataObj = new FormData(e.currentTarget)
    const selectedCategories = Array.from(formDataObj.getAll('categories')).map(String)
    
    const entry = {
      id: Date.now().toString(),
      title: formDataObj.get('title'),
      content: formDataObj.get('content'),
      imageUrl: imagePreview || formDataObj.get('imageUrl'),
      url: formDataObj.get('url')?.toString() || '',
      tags: formDataObj.get('tags')?.toString().split(',').map(tag => tag.trim()) || [],
      categories: selectedCategories,
      createdAt: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        throw new Error('Failed to save entry')
      }

      router.push('/')
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Create New Entry</h1>
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
              <label htmlFor="title" className="block text-sm font-medium text-slate-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={formData.title}
                className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200 placeholder-slate-400"
                placeholder="Enter title"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Category
              </label>
              <div className="flex gap-2">
                <select
                  name="categories"
                  className="flex-1 rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200"
                  defaultValue=""
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="px-4 py-2 bg-emerald-800 text-emerald-100 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Category
                </button>
              </div>

              {/* Add Category Dialog */}
              {isAddingCategory && (
                <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Add New Category</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter category name"
                        className="w-full rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200 placeholder-slate-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false)
                            setNewCategory('')
                          }}
                          className="px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCategory(newCategory)}
                          className="px-4 py-2 bg-emerald-800 text-emerald-100 rounded-md hover:bg-emerald-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Image
              </label>
              {imagePreview && (
                <div className="mb-4 relative h-48 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute top-2 right-2 bg-slate-900/80 text-slate-200 p-2 rounded-full hover:bg-slate-800/80"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-slate-700 file:text-slate-300
                    hover:file:bg-slate-600
                    cursor-pointer"
                />
                <span className="text-xs text-slate-400">or</span>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="Enter image URL"
                  defaultValue={formData.imageUrl}
                  onChange={(e) => setImagePreview(e.target.value)}
                  className="flex-1 rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200 placeholder-slate-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-300">
                Recipe URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                defaultValue={formData.url}
                className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200 placeholder-slate-400"
                placeholder="https://example.com/recipe"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="content" className="block text-sm font-medium text-slate-300">
                    Content
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const content = document.getElementById('content') as HTMLTextAreaElement;
                      try {
                        const clipboardText = await navigator.clipboard.readText();
                        if (clipboardText) {
                          // Set the value and update form state
                          content.value = clipboardText;
                          // Update the form state by triggering an input event
                          content.dispatchEvent(new Event('input', { bubbles: true }));
                          // Focus the textarea
                          content.focus();
                        }
                      } catch (error) {
                        console.error('Failed to read clipboard:', error);
                        // Fallback to execCommand for older browsers
                        content.value = '';
                        content.focus();
                        document.execCommand('paste');
                      }
                    }}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                    title="Paste from clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const content = document.getElementById('content') as HTMLTextAreaElement;
                    if (!content.value) return;

                    const prompt = `Extract only the recipe from the given text block, removing all unnecessary content such as ratings, comments, ads, and metadata. Format the extracted recipe clearly with ingredients and step-by-step instructions. The response should contain only the formatted recipe without any additional words or explanations.

${content.value}`;

                    // Copy to clipboard
                    navigator.clipboard.writeText(prompt).then(() => {
                      // Open ChatGPT in a new tab
                      window.open('https://chat.openai.com/', '_blank');
                    }).catch(error => {
                      console.error('Error copying text:', error);
                      // If clipboard fails, still open ChatGPT
                      window.open('https://chat.openai.com/', '_blank');
                    });
                  }}
                  className="flex items-center px-3 py-1 text-sm bg-emerald-800/50 text-emerald-100 rounded-md hover:bg-emerald-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                  Open in ChatGPT
                </button>
              </div>
              <textarea
                id="content"
                name="content"
                required
                rows={6}
                defaultValue={formData.content}
                className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200 placeholder-slate-400 resize-y min-h-[150px]"
                placeholder="Enter your content here..."
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-300">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                defaultValue={formData.tags}
                className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-slate-200 placeholder-slate-400"
                placeholder="Enter tags separated by commas"
              />
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-800 text-emerald-100 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 