'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const categories = [
  { name: 'All Categories', slug: '' },
  { name: 'Rings', slug: 'rings' },
  { name: 'Necklaces', slug: 'necklaces' },
  { name: 'Earrings', slug: 'earrings' },
  { name: 'Bracelets', slug: 'bracelets' },
  { name: 'Watches', slug: 'watches' }
]

const priceRanges = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under KES 5,000', min: '', max: '5000' },
  { label: 'KES 5,000 - 15,000', min: '5000', max: '15000' },
  { label: 'KES 15,000 - 50,000', min: '15000', max: '50000' },
  { label: 'Over KES 50,000', min: '50000', max: '' }
]

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`/products?${params.toString()}`)
  }

  const updatePriceRange = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (min) params.set('priceMin', min)
    else params.delete('priceMin')
    
    if (max) params.set('priceMax', max)
    else params.delete('priceMax')
    
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('q', searchQuery)
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/products')
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-serif text-lg font-medium mb-3">Search</h3>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-900"
          />
          <button
            type="submit"
            className="bg-brand-900 text-white px-4 py-2 rounded-r-lg hover:bg-opacity-90"
          >
            🔍
          </button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-serif text-lg font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => updateFilter('category', category.slug)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                searchParams.get('category') === category.slug || 
                (!searchParams.get('category') && !category.slug)
                  ? 'bg-brand-900 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-serif text-lg font-medium mb-3">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => updatePriceRange(range.min, range.max)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                searchParams.get('priceMin') === range.min && 
                searchParams.get('priceMax') === range.max
                  ? 'bg-brand-900 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  )
}