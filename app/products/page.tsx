import { Suspense } from 'react'
import ProductGrid from '@/components/ProductGrid'
import SearchFilters from '@/components/SearchFilters'

interface ProductsPageProps {
  searchParams: {
    category?: string
    q?: string
    priceMin?: string
    priceMax?: string
    page?: string
  }
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <SearchFilters />
        </aside>

        {/* Products Grid */}
        <main className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-serif text-3xl font-bold">
              {searchParams.category ? 
                `${searchParams.category.replace('-', ' ')} Collection` : 
                'All Products'
              }
            </h1>
            <select className="border rounded-lg px-3 py-2">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="product-card animate-pulse">
          <div className="h-64 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}